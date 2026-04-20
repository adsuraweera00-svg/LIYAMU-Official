import { adminFirestore, FieldValue } from '../config/firebase.js';
import { ApiError } from '../utils/apiError.js';
import bcrypt from 'bcryptjs';

const db = adminFirestore();

export const updateProfile = async (req, res) => {
  const { name, email, phone, bio, theme } = req.body;
  let { socialLinks } = req.body;

  if (typeof socialLinks === 'string') {
    try { socialLinks = JSON.parse(socialLinks); } catch (e) { socialLinks = null; }
  }
  
  const userRef = db.collection('users').doc(req.user.id);
  const updates = {};

  if (email && email !== req.user.email) {
    if (req.user.email === 'liyamu.owner@gmail.com') {
      return res.status(403).json({ message: 'Owner email cannot be changed' });
    }
    const existing = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
    if (!existing.empty) return res.status(400).json({ message: 'Email already in use' });
    updates.email = email.toLowerCase();
  }

  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (bio !== undefined) updates.bio = bio;
  
  if (req.file) {
    updates.profilePicture = req.file.path.startsWith('http') 
      ? req.file.path 
      : `/uploads/${req.file.filename}`;
  }
  
  if (theme) updates['settings.theme'] = theme;
  
  if (socialLinks) {
    updates.socialLinks = {
      facebook: socialLinks.facebook !== undefined ? socialLinks.facebook : (req.user.socialLinks?.facebook || ''),
      whatsapp: socialLinks.whatsapp !== undefined ? socialLinks.whatsapp : (req.user.socialLinks?.whatsapp || ''),
      telegram: socialLinks.telegram !== undefined ? socialLinks.telegram : (req.user.socialLinks?.telegram || ''),
    };
  }

  updates.updatedAt = new Date().toISOString();
  await userRef.update(updates);
  
  const updatedDoc = await userRef.get();
  res.json({ id: updatedDoc.id, ...updatedDoc.data() });
};

export const getAuthors = async (req, res) => {
  const snapshot = await db.collection('users')
    .where('role', 'in', ['author', 'verified_author', 'pro_writer'])
    .where('isBanned', '==', false)
    .get();

  const authors = snapshot.docs.map(doc => {
    const data = doc.data();
    delete data.password;
    return { id: doc.id, ...data };
  });

  // Fetch book counts (simplification: fetch all approved books and count in memory or do per author)
  const booksSnapshot = await db.collection('books').where('status', '==', 'approved').get();
  const bookCounts = {};
  booksSnapshot.forEach(doc => {
    const authorId = doc.data().author;
    bookCounts[authorId] = (bookCounts[authorId] || 0) + 1;
  });

  res.json(authors.map(a => ({ ...a, bookCount: bookCounts[a.id] || 0 })));
};

export const toggleWishlist = async (req, res) => {
  const { bookId } = req.params;
  const userRef = db.collection('users').doc(req.user.id);
  
  const hasBook = (req.user.wishlist || []).some(id => String(id) === String(bookId));
  
  await userRef.update({
    wishlist: hasBook ? FieldValue.arrayRemove(bookId) : FieldValue.arrayUnion(bookId)
  });

  const updated = await userRef.get();
  res.json({ wishlist: updated.data().wishlist || [] });
};

export const toggleFollow = async (req, res) => {
  const { authorId } = req.params;
  const userRef = db.collection('users').doc(req.user.id);
  const authorRef = db.collection('users').doc(authorId);
  
  const authorDoc = await authorRef.get();
  if (!authorDoc.exists) throw new ApiError(404, 'Author not found');

  const isFollowing = (req.user.following || []).some(id => String(id) === String(authorId));

  await db.runTransaction(async (t) => {
    if (isFollowing) {
      t.update(userRef, { following: FieldValue.arrayRemove(authorId) });
      t.update(authorRef, { followersCount: FieldValue.increment(-1) });
    } else {
      t.update(userRef, { following: FieldValue.arrayUnion(authorId) });
      t.update(authorRef, { followersCount: FieldValue.increment(1) });
      
      const notifRef = db.collection('notifications').doc();
      t.set(notifRef, {
        user: authorId,
        title: 'New Follower!',
        message: `${req.user.name} started following you.`,
        type: 'user',
        createdAt: new Date().toISOString(),
        read: false
      });
    }
  });

  const updatedUser = await userRef.get();
  const updatedAuthor = await authorRef.get();
  res.json({ 
    following: updatedUser.data().following || [], 
    followersCount: updatedAuthor.data().followersCount || 0 
  });
};

export const getFollowedAuthors = async (req, res) => {
  if (!req.user.following || req.user.following.length === 0) return res.json([]);
  
  const snapshot = await db.collection('users').where('__name__', 'in', req.user.following).get();
  res.json(snapshot.docs.map(doc => {
    const data = doc.data();
    return { id: doc.id, name: data.name, profilePicture: data.profilePicture, role: data.role, followersCount: data.followersCount, bio: data.bio };
  }));
};

export const updateReadingProgress = async (req, res) => {
  const { bookId } = req.params;
  const userRef = db.collection('users').doc(req.user.id);

  await userRef.update({
    lastReadBook: bookId,
    readingHistory: FieldValue.arrayUnion(bookId)
  });

  res.json({ lastReadBook: bookId });
};

export const toggleBookmark = async (req, res) => {
  const { workId } = req.params;
  const userRef = db.collection('users').doc(req.user.id);

  const hasBookmarked = (req.user.bookmarkedWorks || []).some(id => String(id) === String(workId));

  await userRef.update({
    bookmarkedWorks: hasBookmarked ? FieldValue.arrayRemove(workId) : FieldValue.arrayUnion(workId)
  });

  const updated = await userRef.get();
  res.json({ bookmarkedWorks: updated.data().bookmarkedWorks || [] });
};

export const getBookmarkedWorks = async (req, res) => {
  if (!req.user.bookmarkedWorks || req.user.bookmarkedWorks.length === 0) return res.json([]);
  
  const snapshot = await db.collection('creativeWorks').where('__name__', 'in', req.user.bookmarkedWorks).get();
  const works = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const authorIds = [...new Set(works.map(w => w.author))];
  const authors = {};
  
  if (authorIds.length > 0) {
    const userSnap = await db.collection('users').where('__name__', 'in', authorIds).get();
    userSnap.forEach(d => authors[d.id] = d.data());
  }

  res.json(works.map(w => {
    const a = authors[w.author];
    return { ...w, author: { id: w.author, name: a?.name, profilePicture: a?.profilePicture } };
  }));
};

export const deleteMyAccount = async (req, res) => {
  if (req.user.email === 'liyamu.owner@gmail.com') throw new ApiError(403, 'Owner account cannot be deleted');

  const userRef = db.collection('users').doc(req.user.id);
  const originalName = req.user.name;

  await userRef.update({
    isDeleted: true,
    deletedAt: new Date().toISOString(),
    name: `[DELETED USER ${req.user.id.slice(-4)}]`,
    email: `deleted_${Date.now()}_${req.user.id}@liyamu.com`,
    password: 'N/A'
  });

  await db.collection('notifications').add({
    user: req.user.id,
    title: 'Account Deleted',
    message: `Hello ${originalName}, your account has been successfully deleted.`,
    type: 'user',
    createdAt: new Date().toISOString(),
    read: false
  });

  res.json({ success: true, message: 'Account deleted successfully' });
};

export const getAuthorProfile = async (req, res) => {
  const { id } = req.params;
  const authorDoc = await db.collection('users').doc(id).get();
  if (!authorDoc.exists) throw new ApiError(404, 'Author not found');

  const authorData = authorDoc.data();
  delete authorData.password;

  const booksSnapshot = await db.collection('books')
    .where('author', '==', id)
    .where('status', '==', 'approved')
    .orderBy('createdAt', 'desc')
    .get();
  
  const creativeWorksSnapshot = await db.collection('creativeWorks')
    .where('author', '==', id)
    .where('status', '==', 'approved')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  res.json({
    id: authorDoc.id,
    ...authorData,
    books: booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    creativeWorks: creativeWorksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  });
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) throw new ApiError(400, 'All fields are required');
  if (newPassword !== confirmPassword) throw new ApiError(400, 'Passwords do not match');
  if (newPassword.length < 6) throw new ApiError(400, 'Minimum 6 characters');

  if (req.user.socialProvider !== 'local') throw new ApiError(400, 'Social accounts cannot change password');

  const isMatch = await bcrypt.compare(currentPassword, req.user.password);
  if (!isMatch) throw new ApiError(401, 'Incorrect current password');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await db.collection('users').doc(req.user.id).update({ password: hashedPassword });
  res.json({ message: 'Password updated successfully' });
};
