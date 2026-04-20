import { adminFirestore } from '../config/firebase.js';
import { ApiError } from '../utils/apiError.js';

const db = adminFirestore();

export const getNotifications = async (req, res) => {
  const snapshot = await db.collection('notifications')
    .where('user', '==', req.user.id)
    .orderBy('createdAt', 'desc')
    .get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};

export const markRead = async (req, res) => {
  const ref = db.collection('notifications').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists || doc.data().user !== req.user.id) throw new ApiError(404, 'Notification not found');

  await ref.update({ read: true });
  res.json({ id: doc.id, ...doc.data(), read: true });
};

export const markAllRead = async (req, res) => {
  const snapshot = await db.collection('notifications')
    .where('user', '==', req.user.id)
    .where('read', '==', false)
    .get();
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => batch.update(doc.ref, { read: true }));
  await batch.commit();
  
  res.json({ message: 'All notifications marked as read' });
};

export const deleteNotification = async (req, res) => {
  const ref = db.collection('notifications').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists || doc.data().user !== req.user.id) throw new ApiError(404, 'Notification not found');

  await ref.delete();
  res.json({ message: 'Notification deleted' });
};
