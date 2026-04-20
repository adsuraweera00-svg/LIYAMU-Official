import { adminFirestore, FieldValue } from '../config/firebase.js';
import { notifyAdmins } from '../utils/notificationHelper.js';
import { ApiError } from '../utils/apiError.js';

const db = adminFirestore();

export const createBook = async (req, res) => {
  const allowedRoles = ['author', 'verified_author', 'pro_writer'];
  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, 'Only authors can publish books');
  }

  const { title, category, documentType, content, price = 0 } = req.body;
  if (!title || !category || !documentType) throw new ApiError(400, 'Missing required fields');

  let coverUrl = req.body.coverUrl;
  let pdfUrl = req.body.pdfUrl;

  if (req.files) {
    if (req.files.cover) {
      coverUrl = req.files.cover[0].path.startsWith('http') 
        ? req.files.cover[0].path 
        : `/uploads/${req.files.cover[0].filename}`;
    }
    if (req.files.pdf) {
      pdfUrl = req.files.pdf[0].path.startsWith('http') 
        ? req.files.pdf[0].path 
        : `/uploads/${req.files.pdf[0].filename}`;
    }
  }

  const isPro = req.user.isPro;
  const safePrice = isPro ? Number(price) || 0 : 0;
  
  const bookData = {
    title,
    category,
    documentType,
    content: documentType === 'text' ? (content || '') : '',
    pdfUrl: documentType === 'pdf' ? (pdfUrl || '') : '',
    coverUrl: coverUrl || '',
    author: req.user.id,
    price: safePrice,
    isFree: safePrice === 0,
    status: 'pending',
    viewCount: 0,
    sellCount: 0,
    ratingAverage: 0,
    ratingCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const docRef = await db.collection('books').add(bookData);

  await db.collection('notifications').add({
    user: req.user.id,
    title: 'Book submitted',
    message: `${title} has been sent for admin review.`,
    type: 'book',
    createdAt: new Date().toISOString(),
    read: false
  });

  await notifyAdmins({
    title: 'Content Review Needed',
    message: `A new book "${title}" needs review.`,
    type: 'book',
    metadata: { action_type: 'book_submission', title, authorName: req.user.name, category }
  });

  res.status(201).json({ id: docRef.id, ...bookData });
};

export const getBooks = async (req, res) => {
  const { search = '', type } = req.query;
  let query = db.collection('books')
    .where('status', '==', 'approved');

  if (type === 'free') query = query.where('isFree', '==', true);
  if (type === 'buy') query = query.where('isFree', '==', false);

  const snapshot = await query.get();
  let books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (search) {
    const s = search.toLowerCase();
    books = books.filter(b => b.title.toLowerCase().includes(s));
  }

  // Populate authors
  const authorIds = [...new Set(books.map(b => b.author))];
  const authors = {};
  if (authorIds.length > 0) {
    const authorSnapshot = await db.collection('users').where('__name__', 'in', authorIds).get();
    authorSnapshot.forEach(doc => { authors[doc.id] = doc.data(); });
  }

  res.json(books.map(b => {
    const a = authors[b.author];
    return { ...b, author: { id: b.author, name: a?.name, badges: a?.badges, followersCount: a?.followersCount } };
  }));
};

export const getMyBooks = async (req, res) => {
  const snapshot = await db.collection('books')
    .where('author', '==', req.user.id)
    .orderBy('createdAt', 'desc')
    .get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};

export const getBookById = async (req, res) => {
  const bookRef = db.collection('books').doc(req.params.id);
  const bookDoc = await bookRef.get();
  if (!bookDoc.exists) throw new ApiError(404, 'Book not found');

  const bookData = bookDoc.data();
  const authorDoc = await db.collection('users').doc(bookData.author).get();
  const authorData = authorDoc.data();

  if (bookData.status !== 'approved' && String(bookData.author) !== String(req.user.id)) {
    throw new ApiError(403, 'Access denied');
  }

  const reviewsSnapshot = await db.collection('reviews')
    .where('book', '==', req.params.id)
    .orderBy('createdAt', 'desc')
    .get();
  
  // Optimized reviews population
  const reviewerIds = [...new Set(reviewsSnapshot.docs.map(d => d.data().user))];
  const reviewers = {};
  if (reviewerIds.length > 0) {
    const userSnap = await db.collection('users').where('__name__', 'in', reviewerIds).get();
    userSnap.forEach(d => reviewers[d.id] = d.data());
  }

  const reviews = reviewsSnapshot.docs.map(d => {
    const rData = d.data();
    const uData = reviewers[rData.user];
    return { id: d.id, ...rData, user: { id: rData.user, name: uData?.name, profilePicture: uData?.profilePicture } };
  });

  // Increment view count
  await bookRef.update({ viewCount: (bookData.viewCount || 0) + 1 });
  
  const bookObj = { id: bookDoc.id, ...bookData };
  const isOwner = String(bookData.author) === String(req.user.id);
  const isPurchased = (req.user.purchasedBooks || []).some(id => String(id) === String(bookDoc.id));
  const isAdmin = req.user.role === 'admin';

  if (!bookData.isFree && !isOwner && !isPurchased && !isAdmin) {
    delete bookObj.content;
    delete bookObj.pdfUrl;
    bookObj.requiresPurchase = true;
  }
  
  res.json({ ...bookObj, author: { id: authorDoc.id, name: authorData?.name, badges: authorData?.badges, followersCount: authorData?.followersCount }, reviews });
};

export const purchaseBook = async (req, res) => {
  const bookRef = db.collection('books').doc(req.params.id);
  const userRef = db.collection('users').doc(req.user.id);

  try {
    const result = await db.runTransaction(async (t) => {
      const bDoc = await t.get(bookRef);
      if (!bDoc.exists || bDoc.data().status !== 'approved') throw new Error('Book not available');
      const bData = bDoc.data();
      if (bData.isFree) throw new Error('This book is free');

      const uDoc = await t.get(userRef);
      const uData = uDoc.data();
      if ((uData.purchasedBooks || []).includes(req.params.id)) throw new Error('Already purchased');

      const price = bData.price;
      const totalBalance = (uData.creditBalance || 0) + (uData.earningsBalance || 0);
      if (totalBalance < price) throw new Error(`Insufficient credits. Need ${price}.`);

      const authorRef = db.collection('users').doc(bData.author);
      const websiteTax = Math.floor(price * 0.1);
      const authorEarnings = price - websiteTax;

      // Deduct from buyer
      let rem = price;
      let newCB = uData.creditBalance || 0;
      let newEB = uData.earningsBalance || 0;

      if (newCB >= rem) { newCB -= rem; } 
      else { rem -= newCB; newCB = 0; newEB -= rem; }

      t.update(userRef, { 
        creditBalance: newCB, 
        earningsBalance: newEB, 
        purchasedBooks: FieldValue.arrayUnion(req.params.id),
        updatedAt: new Date().toISOString()
      });

      // Credit author
      t.update(authorRef, { earningsBalance: FieldValue.increment(authorEarnings) });
      t.update(bookRef, { sellCount: FieldValue.increment(1) });

      // Records
      const purchaseRef = db.collection('purchases').doc();
      t.set(purchaseRef, {
        buyer: req.user.id, book: req.params.id, soldPrice: price, websiteTax, authorEarnings, createdAt: new Date().toISOString()
      });

      const t1 = db.collection('creditTransactions').doc();
      t.set(t1, { user: req.user.id, type: 'spend', amount: price, description: `Bought: ${bData.title}`, createdAt: new Date().toISOString() });

      const t2 = db.collection('creditTransactions').doc();
      t.set(t2, { user: bData.author, type: 'refund', amount: authorEarnings, description: `Sold: ${bData.title}`, createdAt: new Date().toISOString() });

      return { newBalance: newCB, authorId: bData.author, title: bData.title, authorEarnings, price };
    });

    // Notifications (Async)
    db.collection('notifications').add({
      user: req.user.id, title: 'Purchase successful', message: `Spent ${result.price} on ${result.title}.`, type: 'purchase', createdAt: new Date().toISOString(), read: false
    });
    db.collection('notifications').add({
      user: result.authorId, title: 'New sale', message: `${result.title} sold. +${result.authorEarnings} credits.`, type: 'earnings', createdAt: new Date().toISOString(), read: false
    });

    res.json({ success: true, balance: result.newBalance });
  } catch (error) {
    throw new ApiError(400, error.message);
  }
};

export const reviewBook = async (req, res) => {
  const { rating, comment } = req.body;
  const bookRef = db.collection('books').doc(req.params.id);
  const bookDoc = await bookRef.get();
  if (!bookDoc.exists) throw new ApiError(404, 'Book not found');

  const reviewId = `${req.user.id}_${req.params.id}`;
  await db.collection('reviews').doc(reviewId).set({
    book: req.params.id,
    user: req.user.id,
    rating: Number(rating),
    comment,
    createdAt: new Date().toISOString()
  });

  const reviewsSnapshot = await db.collection('reviews').where('book', '==', req.params.id).get();
  const reviews = reviewsSnapshot.docs.map(d => d.data());
  const avg = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;

  await bookRef.update({ ratingAverage: avg, ratingCount: reviews.length });

  await notifyAdmins({
    title: 'New Book Review',
    message: `${req.user.name} rated "${bookDoc.data().title}" ${rating} stars.`,
    type: 'social',
    metadata: { action_type: 'book_review', bookTitle: bookDoc.data().title, reviewerName: req.user.name, rating }
  });

  // Check for proWriter badge
  const authorBooksSnapshot = await db.collection('books')
    .where('author', '==', bookDoc.data().author)
    .where('status', '==', 'approved')
    .get();
  
  const authorBooks = authorBooksSnapshot.docs.map(d => d.data()).filter(b => b.ratingCount > 0);
  const authorAvg = authorBooks.length
    ? authorBooks.reduce((sum, item) => sum + (item.ratingAverage / 5) * 100, 0) / authorBooks.length
    : 0;

  if (authorAvg > 70) {
    await db.collection('users').doc(bookDoc.data().author).update({ 'badges.proWriter': true });
  }

  res.json({ success: true, ratingAverage: avg });
};

export const getAuthorStats = async (req, res) => {
  const snapshot = await db.collection('books')
    .where('author', '==', req.user.id)
    .where('status', '==', 'approved')
    .get();

  let totalViews = 0, totalSales = 0, sumRating = 0, ratedCount = 0;
  snapshot.docs.forEach(doc => {
    const d = doc.data();
    totalViews += (d.viewCount || 0);
    totalSales += (d.sellCount || 0);
    if (d.ratingCount > 0) {
      sumRating += (d.ratingAverage || 0);
      ratedCount++;
    }
  });

  res.json({
    totalViews,
    totalSales,
    avgRating: ratedCount > 0 ? sumRating / ratedCount : 0,
    bookCount: snapshot.size
  });
};

export const deleteBook = async (req, res) => {
  const bookRef = db.collection('books').doc(req.params.id);
  const bookDoc = await bookRef.get();
  if (!bookDoc.exists) throw new ApiError(404, 'Book not found');

  if (bookDoc.data().author !== req.user.id) throw new ApiError(403, 'Permission denied');

  // Deleting reviews associated
  const reviewsSnapshot = await db.collection('reviews').where('book', '==', req.params.id).get();
  const batch = db.batch();
  reviewsSnapshot.forEach(d => batch.delete(d.ref));
  batch.delete(bookRef);
  await batch.commit();

  await db.collection('notifications').add({
    user: req.user.id,
    title: 'Book Deleted',
    message: `Your book "${bookDoc.data().title}" has been removed.`,
    type: 'book',
    createdAt: new Date().toISOString(),
    read: false
  });

  res.json({ success: true, message: 'Book deleted' });
};
