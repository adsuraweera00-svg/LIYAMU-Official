import { adminFirestore } from '../config/firebase.js';
import { ApiError } from '../utils/apiError.js';

const db = adminFirestore();

export const sendMessage = async (req, res) => {
  const { message, recipientId } = req.body;
  if (!message) throw new ApiError(400, 'Message is required');

  const chatData = {
    message,
    createdAt: new Date().toISOString(),
    isRead: false
  };

  if (req.user.role === 'admin') {
    if (!recipientId) throw new ApiError(400, 'Recipient ID required');
    chatData.user = recipientId;
    chatData.admin = req.user.id;
    chatData.sender = 'admin';

    await db.collection('notifications').add({
      user: recipientId,
      title: 'New message from Admin',
      message: 'Support response received.',
      type: 'user',
      createdAt: new Date().toISOString(),
      read: false
    });
  } else {
    chatData.user = req.user.id;
    chatData.sender = 'user';

    const adminsSnapshot = await db.collection('users').where('role', '==', 'admin').get();
    const batch = db.batch();
    adminsSnapshot.forEach(doc => {
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, {
        user: doc.id,
        title: 'New Support Message',
        message: `Message from ${req.user.name}.`,
        type: 'user',
        createdAt: new Date().toISOString(),
        read: false
      });
    });
    await batch.commit();
  }

  const docRef = await db.collection('chatMessages').add(chatData);
  res.status(201).json({ id: docRef.id, ...chatData });
};

export const getMyChatHistory = async (req, res) => {
  const snapshot = await db.collection('chatMessages')
    .where('user', '==', req.user.id)
    .orderBy('createdAt', 'asc')
    .get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};

export const getAdminChats = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    // Unique users simulation
    const snapshot = await db.collection('chatMessages').get();
    const uniqueUserIds = [...new Set(snapshot.docs.map(doc => doc.data().user))];
    
    if (uniqueUserIds.length === 0) return res.json([]);
    
    const userSnapshot = await db.collection('users').where('__name__', 'in', uniqueUserIds).get();
    return res.json(userSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, email: doc.data().email, role: doc.data().role })));
  }

  const snapshot = await db.collection('chatMessages')
    .where('user', '==', userId)
    .orderBy('createdAt', 'asc')
    .get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};

export const markAsRead = async (req, res) => {
  const { userId } = req.params;
  let query = db.collection('chatMessages').where('isRead', '==', false);
  
  if (req.user.role === 'admin') {
    query = query.where('user', '==', userId).where('sender', '==', 'user');
  } else {
    query = query.where('user', '==', req.user.id).where('sender', '==', 'admin');
  }

  const snapshot = await query.get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.update(doc.ref, { isRead: true }));
  await batch.commit();
  
  res.json({ success: true });
};
