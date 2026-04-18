import User from '../models/User.js';
import Book from '../models/Book.js';
import Purchase from '../models/Purchase.js';
import Notification from '../models/Notification.js';
import Review from '../models/Review.js';
import CreativeWork from '../models/CreativeWork.js';
import { ApiError } from '../utils/apiError.js';

export const getAdminOverview = async (req, res) => {
  const [users, authors, pendingBooks, purchases] = await Promise.all([
    User.countDocuments({ role: { $in: ['beginner_reader', 'pro_reader'] } }),
    User.countDocuments({ role: { $in: ['author', 'verified_author', 'pro_writer'] } }),
    Book.countDocuments({ status: 'pending' }),
    Purchase.find().populate('book', 'title price').sort({ createdAt: -1 }),
  ]);
  res.json({ users, authors, pendingBooks, purchases });
};

export const getAllUsers = async (req, res) => {
  const users = await User.find({ isDeleted: { $ne: true } }).select('-password').sort({ createdAt: -1 });
  res.json(users);
};

export const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  const { isBanned, role, badges } = req.body;
  const oldRole = user.role;

  // PROTECTION: Prevent modifying the owner account
  const isOwner = user.email === 'liyamu.owner@gmail.com' || user.badges?.owner;
  if (isOwner) {
    if (typeof isBanned === 'boolean' && isBanned !== user.isBanned) {
      throw new ApiError(403, 'The Owner account cannot be suspended or banned.');
    }
    if (role && role !== user.role) {
      throw new ApiError(403, 'The Owner account role cannot be changed.');
    }
  }

  if (typeof isBanned === 'boolean') user.isBanned = isBanned;
  
  const validRoles = ['reader', 'beginner_reader', 'pro_reader', 'author', 'verified_author', 'pro_writer', 'admin'];
  if (role && validRoles.includes(role)) {
    // Prevent self-demotion from admin
    if (req.user._id.toString() === user._id.toString() && role !== 'admin') {
      throw new ApiError(400, 'You cannot remove your own admin role');
    }
    user.role = role;
  }

  if (badges) user.badges = { ...user.badges, ...badges };
  await user.save();

  // Notify user if role has changed
  if (role && role !== oldRole) {
    await Notification.create({
      user: user._id,
      title: 'Member Rank Updated',
      message: `Your account role has been updated to ${role.replace('_', ' ')}. Your access permissions have changed accordingly.`,
      type: 'user'
    });
  }

  res.json(user);
};

export const getBookSubmissions = async (req, res) => {
  const books = await Book.find().populate('author', 'name email').sort({ createdAt: -1 });
  res.json(books);
};

export const reviewBookSubmission = async (req, res) => {
  const { status, rejectionReason } = req.body;
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found');
  book.status = status;
  if (rejectionReason) book.rejectionReason = rejectionReason;
  await book.save();

  await Notification.create({
    user: book.author,
    title: `Book ${status}`,
    message: status === 'approved' ? `${book.title} is now public.` : `${book.title} was rejected: ${rejectionReason}`,
    type: 'book',
  });

  res.json(book);
};

export const deleteBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found');

  // Cascade delete associated reviews and purchases
  await Promise.all([
    Review.deleteMany({ book: book._id }),
    Purchase.deleteMany({ book: book._id })
  ]);

  if (book.author) {
    await Notification.create({
      user: book.author,
      title: 'Book Removed',
      message: `Your book "${book.title}" was permanently removed from the platform by administration.`,
      type: 'book',
    });
  }

  await book.deleteOne();
  res.json({ success: true, message: 'Book and associated data permanently removed.' });
};

export const toggleBookVisibility = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, 'Book not found');

  book.isHidden = !book.isHidden;
  await book.save();

  res.json(book);
};

// Enhanced Reviews: Latest 20 or Filter by Book
export const getAllUserReviews = async (req, res) => {
  const { bookId } = req.query;
  const query = {};
  if (bookId) query.book = bookId;

  const reviews = await Review.find(query)
    .populate('book', 'title coverUrl')
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(bookId ? 1000 : 20); // Show all for specific book, 20 for latest
  res.json(reviews);
};

export const deleteUserReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found');
  
  const book = await Book.findById(review.book);
  if (book) {
    const reviews = await Review.find({ book: book._id, _id: { $ne: review._id } });
    if (reviews.length > 0) {
      book.ratingAverage = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
      book.ratingCount = reviews.length;
    } else {
      book.ratingAverage = 0;
      book.ratingCount = 0;
    }
    await book.save();
  }

  await review.deleteOne();
  res.json({ success: true });
};

// Creative Corner Review logic
export const getAdminCreativeWorks = async (req, res) => {
  const works = await CreativeWork.find()
    .populate('author', 'name profilePicture email')
    .sort({ createdAt: -1 });
  res.json(works);
};

export const reviewCreativeWork = async (req, res) => {
  const { status, rejectionReason } = req.body;
  const work = await CreativeWork.findById(req.params.id);
  if (!work) throw new ApiError(404, 'Creative work not found');

  work.status = status;
  if (rejectionReason) work.rejectionReason = rejectionReason;
  await work.save();

  await Notification.create({
    user: work.author,
    title: `Creative Work ${status === 'approved' ? 'Approved' : 'Rejected'}`,
    message: status === 'approved' 
      ? `Your work "${work.title}" has been published and is now visible to the community.`
      : `Your work "${work.title}" was rejected. Reason: ${rejectionReason || 'Policy violation.'}`,
    type: 'creative',
  });

  res.json(work);
};

export const deleteCreativeWork = async (req, res) => {
  const work = await CreativeWork.findById(req.params.id);
  if (!work) throw new ApiError(404, 'Creative work not found');

  await Notification.create({
    user: work.author,
    title: 'Content Moderated',
    message: `Your creative work "${work.title}" has been removed by an administrator for violating community guidelines.`,
    type: 'creative',
  });

  await work.deleteOne();
  res.json({ success: true });
};

// Secure User Deletion
export const deleteUser = async (req, res) => {
  const { adminPassword } = req.body;
  const admin = await User.findById(req.user._id);
  
  const isMatch = await admin.matchPassword(adminPassword);
  if (!isMatch) throw new ApiError(401, 'Invalid admin password. Deletion unauthorized.');

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  
  // PROTECTION: Prevent deleting the owner account
  const isOwner = user.email === 'liyamu.owner@gmail.com' || user.badges?.owner;
  if (isOwner) throw new ApiError(403, 'The Owner account cannot be deleted.');

  if (user.role === 'admin') throw new ApiError(403, 'Administrators cannot be deleted via this dashboard.');

  // Notify user (simulated as we delete their account next)
  // In a real app, an email would be sent here.

  // 1. Cascade Delete
  await Promise.all([
    Book.deleteMany({ author: user._id }),
    CreativeWork.deleteMany({ author: user._id }),
    Review.deleteMany({ user: user._id }),
    Notification.deleteMany({ user: user._id }),
    Purchase.deleteMany({ user: user._id })
  ]);

  // 2. Soft-delete user for Audit or Hard-delete? User requested "remove all associated data" 
  // but also "add a section to view deleted user accounts". This implies Soft Delete.
  user.isDeleted = true;
  user.deletedAt = new Date();
  // Clear sensitive data
  user.name = `[DELETED USER ${user._id.toString().slice(-4)}]`;
  user.email = `deleted_${Date.now()}@liyamu.com`;
  user.phone = 'N/A';
  user.password = 'N/A';
  user.profilePicture = null;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: 'User and all associated data permanently removed.' });
};

export const getDeletedUsers = async (req, res) => {
  const users = await User.find({ isDeleted: true }).sort({ deletedAt: -1 });
  res.json(users);
};
