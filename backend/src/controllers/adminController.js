import { adminFirestore } from '../config/firebase.js';
import { ApiError } from '../utils/apiError.js';
import bcrypt from 'bcryptjs';

const db = adminFirestore();

export const getAdminOverview = async (req, res) => {
  const [userSnap, authorSnap, pendingBookSnap, purchaseSnap] = await Promise.all([
    db.collection('users').where('role', 'in', ['beginner_reader', 'pro_reader', 'reader']).get(),
    db.collection('users').where('role', 'in', ['author', 'verified_author', 'pro_writer']).get(),
    db.collection('books').where('status', '==', 'pending').get(),
    db.collection('purchases').orderBy('createdAt', 'desc').get()
  ]);

  res.json({
    users: userSnap.size,
    authors: authorSnap.size,
    pendingBooks: pendingBookSnap.size,
    purchases: purchaseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  });
};

export const getAllUsers = async (req, res) => {
  const snapshot = await db.collection('users')
    .where('isDeleted', '==', false)
    .orderBy('createdAt', 'desc')
    .get();
  res.json(snapshot.docs.map(doc => {
    const data = doc.data();
    delete data.password;
    return { id: doc.id, ...data };
  }));
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { isBanned, role, badges } = req.body;

  const userRef = db.collection('users').doc(id);
  const userDoc = await userRef.get();
  if (!userDoc.exists) throw new ApiError(404, 'User not found');
  const userData = userDoc.data();

  const isOwner = userData.email === 'liyamu.owner@gmail.com' || userData.badges?.owner;
  if (isOwner) {
    if (typeof isBanned === 'boolean' && isBanned !== userData.isBanned) throw new ApiError(403, 'Owner cannot be banned.');
    if (role && role !== userData.role) throw new ApiError(403, 'Owner role cannot be changed.');
  }

  const updates = {};
  if (typeof isBanned === 'boolean') updates.isBanned = isBanned;
  
  if (role) {
    if (req.user.id === id && role !== 'admin') throw new ApiError(400, 'Cannot remove own admin role');
    updates.role = role;
  }

  if (badges) {
    for (const [k, v] of Object.entries(badges)) updates[`badges.${k}`] = v;
  }

  await userRef.update(updates);

  if (role && role !== userData.role) {
    await db.collection('notifications').add({
      user: id,
      title: 'Rank Updated',
      message: `Your role was updated to ${role}.`,
      type: 'user',
      createdAt: new Date().toISOString(),
      read: false
    });
  }

  const updated = await userRef.get();
  res.json({ id: updated.id, ...updated.data() });
};

export const getBookSubmissions = async (req, res) => {
  const snapshot = await db.collection('books').orderBy('createdAt', 'desc').get();
  const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const userIds = [...new Set(books.map(b => b.author))];
  const users = {};
  if (userIds.length > 0) {
    const userSnap = await db.collection('users').where('__name__', 'in', userIds).get();
    userSnap.forEach(d => users[d.id] = d.data());
  }

  res.json(books.map(b => ({ ...b, author: { id: b.author, name: users[b.author]?.name, email: users[b.author]?.email } })));
};

export const reviewBookSubmission = async (req, res) => {
  const { status, rejectionReason } = req.body;
  const ref = db.collection('books').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) throw new ApiError(404, 'Book not found');

  const updates = { status, updatedAt: new Date().toISOString() };
  if (rejectionReason) updates.rejectionReason = rejectionReason;
  await ref.update(updates);

  await db.collection('notifications').add({
    user: doc.data().author,
    title: `Book ${status}`,
    message: status === 'approved' ? `${doc.data().title} is live.` : `${doc.data().title} rejected: ${rejectionReason}`,
    type: 'book',
    createdAt: new Date().toISOString(),
    read: false
  });

  res.json({ id: doc.id, ...doc.data(), ...updates });
};

export const deleteBook = async (req, res) => {
  const ref = db.collection('books').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) throw new ApiError(404, 'Book not found');

  // Cascade
  const batch = db.batch();
  const reviews = await db.collection('reviews').where('book', '==', req.params.id).get();
  reviews.forEach(d => batch.delete(d.ref));
  
  const purchases = await db.collection('purchases').where('book', '==', req.params.id).get();
  purchases.forEach(d => batch.delete(d.ref));

  batch.delete(ref);
  await batch.commit();

  if (doc.data().author) {
    await db.collection('notifications').add({
      user: doc.data().author,
      title: 'Book Removed',
      message: `Your book "${doc.data().title}" was removed by admin.`,
      type: 'book',
      createdAt: new Date().toISOString(),
      read: false
    });
  }

  res.json({ success: true });
};

export const toggleBookVisibility = async (req, res) => {
  const ref = db.collection('books').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) throw new ApiError(404, 'Book not found');

  const newHidden = !doc.data().isHidden;
  await ref.update({ isHidden: newHidden });
  res.json({ id: doc.id, ...doc.data(), isHidden: newHidden });
};

export const getAllUserReviews = async (req, res) => {
  const { bookId } = req.query;
  let query = db.collection('reviews');
  if (bookId) query = query.where('book', '==', bookId);

  const snapshot = await query.orderBy('createdAt', 'desc').limit(bookId ? 1000 : 20).get();
  const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const bookIds = [...new Set(reviews.map(r => r.book))];
  const userIds = [...new Set(reviews.map(r => r.user))];

  const [books, users] = await Promise.all([
    bookIds.length > 0 ? db.collection('books').where('__name__', 'in', bookIds).get() : { forEach: () => {} },
    userIds.length > 0 ? db.collection('users').where('__name__', 'in', userIds).get() : { forEach: () => {} }
  ]);

  const bookMap = {}, userMap = {};
  books.forEach(d => bookMap[d.id] = d.data());
  users.forEach(d => userMap[d.id] = d.data());

  res.json(reviews.map(r => ({
    ...r,
    book: { id: r.book, title: bookMap[r.book]?.title, coverUrl: bookMap[r.book]?.coverUrl },
    user: { id: r.user, name: userMap[r.user]?.name, profilePicture: userMap[r.user]?.profilePicture }
  })));
};

export const deleteUserReview = async (req, res) => {
  const ref = db.collection('reviews').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) throw new ApiError(404, 'Review not found');
  
  const bookId = doc.data().book;
  await ref.delete();

  // Recalculate book stats
  const remainingSnapshot = await db.collection('reviews').where('book', '==', bookId).get();
  const reviews = remainingSnapshot.docs.map(d => d.data());
  const avg = reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : 0;
  
  await db.collection('books').doc(bookId).update({ ratingAverage: avg, ratingCount: reviews.length });

  res.json({ success: true });
};

export const getAdminCreativeWorks = async (req, res) => {
  const snapshot = await db.collection('creativeWorks').orderBy('createdAt', 'desc').get();
  const works = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const userIds = [...new Set(works.map(w => w.author))];
  const users = {};
  if (userIds.length > 0) {
    const userSnap = await db.collection('users').where('__name__', 'in', userIds).get();
    userSnap.forEach(d => users[d.id] = d.data());
  }

  res.json(works.map(w => ({ ...w, author: { id: w.author, name: users[w.author]?.name, email: users[w.author]?.email } })));
};

export const reviewCreativeWork = async (req, res) => {
  const { status, rejectionReason } = req.body;
  const ref = db.collection('creativeWorks').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) throw new ApiError(404, 'Work not found');

  const updates = { status, updatedAt: new Date().toISOString() };
  if (rejectionReason) updates.rejectionReason = rejectionReason;
  await ref.update(updates);

  await db.collection('notifications').add({
    user: doc.data().author,
    title: `Creative Work ${status}`,
    message: status === 'approved' ? `"${doc.data().title}" live.` : `"${doc.data().title}" rejected.`,
    type: 'creative',
    createdAt: new Date().toISOString(),
    read: false
  });

  res.json({ id: doc.id, ...doc.data(), ...updates });
};

export const deleteCreativeWork = async (req, res) => {
  const ref = db.collection('creativeWorks').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) throw new ApiError(404, 'Work not found');

  await db.collection('notifications').add({
    user: doc.data().author,
    title: 'Content Moderated',
    message: `Your work "${doc.data().title}" was removed by admin.`,
    type: 'creative',
    createdAt: new Date().toISOString(),
    read: false
  });

  await ref.delete();
  res.json({ success: true });
};

export const deleteUser = async (req, res) => {
  const { adminPassword } = req.body;
  const adminRef = db.collection('users').doc(req.user.id);
  const adminDoc = await adminRef.get();
  
  const isMatch = await bcrypt.compare(adminPassword, adminDoc.data().password);
  if (!isMatch) throw new ApiError(401, 'Unauthorized');

  const userRef = db.collection('users').doc(req.params.id);
  const userDoc = await userRef.get();
  if (!userDoc.exists) throw new ApiError(404, 'User not found');
  const userData = userDoc.data();
  
  if (userData.email === 'liyamu.owner@gmail.com' || userData.badges?.owner) throw new ApiError(403, 'Owner cannot be deleted.');
  if (userData.role === 'admin') throw new ApiError(403, 'Admins cannot be deleted here.');

  // Cascade
  const batch = db.batch();
  const [books, works, reviews, notifications, purchases] = await Promise.all([
    db.collection('books').where('author', '==', req.params.id).get(),
    db.collection('creativeWorks').where('author', '==', req.params.id).get(),
    db.collection('reviews').where('user', '==', req.params.id).get(),
    db.collection('notifications').where('user', '==', req.params.id).get(),
    db.collection('purchases').where('buyer', '==', req.params.id).get()
  ]);

  books.forEach(d => batch.delete(d.ref));
  works.forEach(d => batch.delete(d.ref));
  reviews.forEach(d => batch.delete(d.ref));
  notifications.forEach(d => batch.delete(d.ref));
  purchases.forEach(d => batch.delete(d.ref));

  batch.update(userRef, {
    isDeleted: true,
    deletedAt: new Date().toISOString(),
    name: `[DELETED USER]`,
    email: `deleted_${Date.now()}@liyamu.com`,
    password: 'N/A'
  });

  await batch.commit();
  res.json({ success: true });
};

export const getDeletedUsers = async (req, res) => {
  const snapshot = await db.collection('users').where('isDeleted', '==', true).orderBy('deletedAt', 'desc').get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};
