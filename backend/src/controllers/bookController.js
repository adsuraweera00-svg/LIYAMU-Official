import Book from '../models/Book.js';
import Purchase from '../models/Purchase.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { notifyAdmins } from '../utils/notificationHelper.js';
import CreditTransaction from '../models/CreditTransaction.js';
import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError.js';

export const createBook = async (req, res) => {
  const allowedRoles = ['author', 'verified_author', 'pro_writer'];
  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, 'Only authors can publish books');
  }

  const { title, category, documentType, content, price = 0 } = req.body;
  if (!title || !category || !documentType) throw new ApiError(400, 'Missing required fields');

  // Handle uploaded files
  let coverUrl = req.body.coverUrl;
  let pdfUrl = req.body.pdfUrl;

  if (req.files) {
    if (req.files.cover) coverUrl = `/uploads/${req.files.cover[0].filename}`;
    if (req.files.pdf) pdfUrl = `/uploads/${req.files.pdf[0].filename}`;
  }

  const isPro = req.user.isPro;
  const safePrice = isPro ? Number(price) || 0 : 0;
  
  const book = await Book.create({
    title,
    category,
    documentType,
    content: documentType === 'text' ? content : '',
    pdfUrl: documentType === 'pdf' ? pdfUrl : '',
    coverUrl,
    author: req.user._id,
    price: safePrice,
    isFree: safePrice === 0,
  });

  await Notification.create({
    user: req.user._id,
    title: 'Book submitted',
    message: `${book.title} has been sent for admin review.`,
    type: 'book',
  });

  // Notify Admins
  await notifyAdmins({
    title: 'Content Review Needed',
    message: `A new book "${book.title}" needs review.`,
    type: 'book',
    metadata: {
      action_type: 'book_submission',
      title: book.title,
      authorName: req.user.name,
      category: category
    }
  });

  res.status(201).json(book);
};

export const getBooks = async (req, res) => {
  const { search = '', type } = req.query;
  const query = {
    status: 'approved',
    isHidden: { $ne: true },
    title: { $regex: search, $options: 'i' },
  };
  if (type === 'free') query.isFree = true;
  if (type === 'buy') query.isFree = false;
  const books = await Book.find(query)
    .select('-content -pdfUrl')
    .populate('author', 'name badges createdAt followersCount');
  res.json(books);
};

export const getMyBooks = async (req, res) => {
  const books = await Book.find({ author: req.user._id }).sort({ createdAt: -1 });
  res.json(books);
};

export const getBookById = async (req, res) => {
  const book = await Book.findById(req.params.id).populate('author', 'name badges followersCount');
  if (!book) throw new ApiError(404, 'Book not found');
  if (book.status !== 'approved' && String(book.author._id) !== String(req.user._id)) {
    throw new ApiError(403, 'Access denied');
  }

  const reviews = await Review.find({ book: book._id })
    .populate('user', 'name profilePicture')
    .sort({ createdAt: -1 });

  book.viewCount += 1;
  await book.save();
  
  const bookObj = book.toObject();
  const isOwner = String(book.author._id) === String(req.user._id);
  const isPurchased = req.user.purchasedBooks.some(id => String(id) === String(book._id));
  const isAdmin = req.user.role === 'admin';

  if (!book.isFree && !isOwner && !isPurchased && !isAdmin) {
    delete bookObj.content;
    delete bookObj.pdfUrl;
    bookObj.requiresPurchase = true;
  }
  
  res.json({ ...bookObj, reviews });
};

export const purchaseBook = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const book = await Book.findById(req.params.id).populate('author').session(session);
    if (!book || book.status !== 'approved') throw new ApiError(404, 'Book not available');
    if (book.isFree) throw new ApiError(400, 'This book is free');
    
    const user = await User.findById(req.user._id).session(session);
    if (user.purchasedBooks.some((id) => String(id) === String(book._id))) {
      throw new ApiError(400, 'Already purchased');
    }

    const totalBalanceAvailable = (user.creditBalance || 0) + (user.earningsBalance || 0);
    if (totalBalanceAvailable < book.price) {
      throw new ApiError(400, `Insufficient credits. You need ${book.price} credits.`);
    }

    const soldPrice = book.price;
    const websiteTax = Math.floor(soldPrice * 0.1); 
    const authorEarnings = soldPrice - websiteTax;

    // Deduct credits (Unified Logic: Credit first, then Earnings)
    let remainingToDeduct = soldPrice;
    
    if (user.creditBalance >= remainingToDeduct) {
      user.creditBalance -= remainingToDeduct;
    } else {
      remainingToDeduct -= user.creditBalance;
      user.creditBalance = 0;
      user.earningsBalance -= remainingToDeduct;
    }

    user.purchasedBooks.push(book._id);
    await user.save({ session });

    // Add credits to author (always goes to earningsBalance now for clarity)
    const author = await User.findById(book.author._id).session(session);
    author.earningsBalance += authorEarnings;
    await author.save({ session });

    // Update book sellCount
    book.sellCount += 1;
    await book.save({ session });

    // Create Purchase record (for library tracking)
    await Purchase.create([{
      buyer: user._id, 
      book: book._id, 
      soldPrice, 
      websiteTax, 
      authorEarnings 
    }], { session });

    // Create Credit Transactions
    await CreditTransaction.create([
      {
        user: user._id,
        type: 'spend',
        amount: soldPrice,
        description: `Purchased book: ${book.title}`,
        metadata: { bookId: book._id }
      },
      {
        user: author._id,
        type: 'refund', // Or a new type 'earn' if we want to be specific, using 'refund' as a proxy for 'credit in' from sale
        amount: authorEarnings,
        description: `Sold book: ${book.title}`,
        metadata: { bookId: book._id }
      }
    ], { session });

    await session.commitTransaction();

    // Send Notifications (non-blocking)
    Notification.insertMany([
      {
        user: user._id,
        title: 'Purchase successful',
        message: `You spent ${soldPrice} credits on ${book.title}.`,
        type: 'purchase',
      },
      {
        user: author._id,
        title: 'New sale',
        message: `${book.title} was sold. ${authorEarnings} credits added to your wallet.`,
        type: 'earnings',
      },
    ]).catch(console.error);

    res.json({ success: true, balance: user.creditBalance });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const reviewBook = async (req, res) => {
  const { rating, comment } = req.body;
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found');

  await Review.findOneAndUpdate(
    { book: book._id, user: req.user._id },
    { rating, comment },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const reviews = await Review.find({ book: book._id });
  const avg = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
  book.ratingAverage = avg;
  book.ratingCount = reviews.length;
  await book.save();

  // Notify Admins about the new review
  await notifyAdmins({
    title: 'New Book Review',
    message: `${req.user.name} rated "${book.title}" ${rating} stars.`,
    type: 'social',
    metadata: {
      action_type: 'book_review',
      bookTitle: book.title,
      reviewerName: req.user.name,
      rating: rating
    }
  });

  const authorBooks = await Book.find({ author: book.author, status: 'approved', ratingCount: { $gt: 0 } });
  const authorAvg = authorBooks.length
    ? authorBooks.reduce((sum, item) => sum + (item.ratingAverage / 5) * 100, 0) / authorBooks.length
    : 0;
  if (authorAvg > 70) {
    const author = await User.findById(book.author);
    author.badges.proWriter = true;
    await author.save();
  }

  res.json({ success: true, ratingAverage: book.ratingAverage });
};

export const getAuthorStats = async (req, res) => {
  const stats = await Book.aggregate([
    { $match: { author: req.user._id, status: 'approved' } },
    {
      $group: {
        _id: null,
        totalViews: { $sum: '$viewCount' },
        totalSales: { $sum: '$sellCount' },
        avgRating: { $avg: '$ratingAverage' },
        bookCount: { $sum: 1 },
      },
    },
  ]);

  res.json(stats[0] || { totalViews: 0, totalSales: 0, avgRating: 0, bookCount: 0 });
};

export const deleteBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found');

  // Verify ownership
  if (book.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only delete your own books');
  }

  // Delete associated reviews
  await Review.deleteMany({ book: book._id });

  // Delete the book
  await book.deleteOne();

  // Notify the author
  await Notification.create({
    user: req.user._id,
    title: 'Book Deleted',
    message: `Your book "${book.title}" has been permanently removed from the platform.`,
    type: 'book',
  });

  res.json({ success: true, message: 'Book deleted successfully' });
};
