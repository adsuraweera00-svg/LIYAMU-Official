import { adminFirestore, FieldValue } from '../config/firebase.js';
import { ApiError } from '../utils/apiError.js';
import ispurify from 'isomorphic-dompurify';
import { notifyAdmins } from '../utils/notificationHelper.js';

const DOMPurify = ispurify;
const db = adminFirestore();

export const createWork = async (req, res) => {
  const { title, content, category, language = 'English', tags = [] } = req.body;
  if (!title || !content || !category) throw new ApiError(400, 'Missing required fields');

  const workData = {
    title,
    content: DOMPurify.sanitize(content),
    category,
    language,
    tags: Array.isArray(tags) ? tags : [tags],
    author: req.user.id,
    status: 'pending',
    viewCount: 0,
    likesCount: 0,
    likes: [],
    comments: [],
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const docRef = await db.collection('creativeWorks').add(workData);

  await notifyAdmins({
    title: 'Creative Corner Moderation',
    message: `New creative work "${title}" posted by ${req.user.name}.`,
    type: 'creative',
    metadata: { action_type: 'creative_submission', title, authorName: req.user.name, category }
  });

  res.status(201).json({ id: docRef.id, ...workData });
};

export const getWorks = async (req, res) => {
  const { search = '', category, language } = req.query;
  
  let query = db.collection('creativeWorks')
    .where('status', '==', 'approved')
    .where('isDeleted', '==', false);

  if (category && category !== 'All') query = query.where('category', '==', category);
  if (language && language !== 'All') query = query.where('language', '==', language);
  
  const snapshot = await query.orderBy('createdAt', 'desc').get();
  let works = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (search) {
    const s = search.toLowerCase();
    works = works.filter(w => 
      w.title.toLowerCase().includes(s) || 
      w.tags.some(t => t.toLowerCase().includes(s))
    );
  }

  // Populate authors
  const authorIds = [...new Set(works.map(w => w.author))];
  const authors = {};
  if (authorIds.length > 0) {
    const authorSnapshot = await db.collection('users').where('__name__', 'in', authorIds).get();
    authorSnapshot.forEach(doc => { authors[doc.id] = doc.data(); });
  }

  res.json(works.map(w => ({
    ...w,
    author: { 
      id: w.author, 
      name: authors[w.author]?.name, 
      profilePicture: authors[w.author]?.profilePicture, 
      badges: authors[w.author]?.badges 
    }
  })));
};

export const getWorkById = async (req, res) => {
  const workRef = db.collection('creativeWorks').doc(req.params.id);
  const workDoc = await workRef.get();
  if (!workDoc.exists) throw new ApiError(404, 'Work not found');

  const workData = workDoc.data();
  const authorDoc = await db.collection('users').doc(workData.author).get();
  const authorData = authorDoc.data();

  if (workData.status !== 'approved' && (!req.user || (req.user.id !== workData.author && req.user.role !== 'admin'))) {
    throw new ApiError(403, 'This work is pending moderation.');
  }

  // Increment view count
  await workRef.update({ viewCount: (workData.viewCount || 0) + 1 });

  // Optimized comments population
  const commentUserIds = [...new Set((workData.comments || []).map(c => c.user))];
  const users = {};
  if (commentUserIds.length > 0) {
    const userSnap = await db.collection('users').where('__name__', 'in', commentUserIds).get();
    userSnap.forEach(d => users[d.id] = d.data());
  }

  const populatedComments = (workData.comments || []).map(c => {
    const uData = users[c.user];
    return { ...c, user: { id: c.user, name: uData?.name, profilePicture: uData?.profilePicture } };
  });

  res.json({
    id: workDoc.id,
    ...workData,
    author: { 
      id: authorDoc.id, 
      name: authorData?.name, 
      profilePicture: authorData?.profilePicture, 
      badges: authorData?.badges, 
      followersCount: authorData?.followersCount 
    },
    comments: populatedComments
  });
};

export const likeWork = async (req, res) => {
  const workRef = db.collection('creativeWorks').doc(req.params.id);
  const workDoc = await workRef.get();
  if (!workDoc.exists) throw new ApiError(404, 'Work not found');

  const workData = workDoc.data();
  const isLiked = (workData.likes || []).includes(req.user.id);

  if (!isLiked) {
    await workRef.update({
      likes: FieldValue.arrayUnion(req.user.id),
      likesCount: FieldValue.increment(1)
    });

    if (workData.author !== req.user.id) {
      await db.collection('notifications').add({
        user: workData.author,
        title: 'New Like on Creative Corner',
        message: `${req.user.name} liked your creative work "${workData.title}".`,
        type: 'creative',
        createdAt: new Date().toISOString(),
        read: false
      });
    }
  } else {
    await workRef.update({
      likes: FieldValue.arrayRemove(req.user.id),
      likesCount: FieldValue.increment(-1)
    });
  }

  res.json({ likesCount: isLiked ? workData.likesCount - 1 : workData.likesCount + 1, isLiked: !isLiked });
};

export const addComment = async (req, res) => {
  const { text } = req.body;
  const workRef = db.collection('creativeWorks').doc(req.params.id);
  const workDoc = await workRef.get();
  if (!workDoc.exists) throw new ApiError(404, 'Work not found');

  const workData = workDoc.data();
  const newComment = { 
    user: req.user.id, 
    text: DOMPurify.sanitize(text), 
    createdAt: new Date().toISOString() 
  };

  await workRef.update({
    comments: FieldValue.arrayUnion(newComment)
  });

  if (workData.author !== req.user.id) {
    await db.collection('notifications').add({
      user: workData.author,
      title: 'New Comment on Creative Corner',
      message: `${req.user.name} commented on your work "${workData.title}".`,
      type: 'creative',
      createdAt: new Date().toISOString(),
      read: false
    });
  }

  // Get all comments and populate (Optimized)
  const updatedWorkDoc = await workRef.get();
  const allComments = updatedWorkDoc.data().comments || [];
  
  const commentUserIds = [...new Set(allComments.map(c => c.user))];
  const usersMap = {};
  if (commentUserIds.length > 0) {
    const userSnap = await db.collection('users').where('__name__', 'in', commentUserIds).get();
    userSnap.forEach(d => usersMap[d.id] = d.data());
  }

  const populatedComments = allComments.map(c => {
    const uData = usersMap[c.user];
    return { ...c, user: { id: c.user, name: uData?.name, profilePicture: uData?.profilePicture } };
  });

  res.json(populatedComments);
};

export const deleteMyWork = async (req, res) => {
  const workRef = db.collection('creativeWorks').doc(req.params.id);
  const workDoc = await workRef.get();
  if (!workDoc.exists) throw new ApiError(404, 'Work not found');

  if (workDoc.data().author !== req.user.id) throw new ApiError(403, 'Unauthorized');

  await workRef.update({
    isDeleted: true,
    deletedAt: new Date().toISOString()
  });

  await db.collection('notifications').add({
    user: req.user.id,
    title: 'Work Deleted',
    message: `Your work "${workDoc.data().title}" has been deleted.`,
    type: 'creative',
    createdAt: new Date().toISOString(),
    read: false
  });

  res.json({ success: true, message: 'Work moved to trash' });
};

export const getUserDeletedWorks = async (req, res) => {
  const snapshot = await db.collection('creativeWorks')
    .where('author', '==', req.user.id)
    .where('isDeleted', '==', true)
    .orderBy('deletedAt', 'desc')
    .get();
  
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};

export const restoreWork = async (req, res) => {
  const workRef = db.collection('creativeWorks').doc(req.params.id);
  const workDoc = await workRef.get();
  if (!workDoc.exists) throw new ApiError(404, 'Work not found');

  if (workDoc.data().author !== req.user.id) throw new ApiError(403, 'Unauthorized');

  await workRef.update({
    isDeleted: false,
    deletedAt: null
  });

  await db.collection('notifications').add({
    user: req.user.id,
    title: 'Work Restored',
    message: `Your work "${workDoc.data().title}" has been restored.`,
    type: 'creative',
    createdAt: new Date().toISOString(),
    read: false
  });

  res.json({ success: true, message: 'Work restored successfully' });
};
