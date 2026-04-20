import { adminFirestore } from '../config/firebase.js';
import { notifyAdmins } from '../utils/notificationHelper.js';
import { ApiError } from '../utils/apiError.js';

const db = adminFirestore();

export const createContactMessage = async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) throw new ApiError(400, 'All fields are required');

  const messageData = {
    name,
    email,
    message,
    status: 'unread',
    createdAt: new Date().toISOString()
  };

  const docRef = await db.collection('contactMessages').add(messageData);

  await notifyAdmins({
    title: 'New Public Inquiry',
    message: `You have received a new message from ${name} (${email}).`,
    type: 'info',
    metadata: {
      action_type: 'contact_inquiry',
      username: name,
      useremail: email,
      inquiryMessage: message
    }
  });

  res.status(201).json({ id: docRef.id, ...messageData });
};

export const getContactMessages = async (req, res) => {
  const snapshot = await db.collection('contactMessages').orderBy('createdAt', 'desc').get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};

export const markAsRead = async (req, res) => {
  const ref = db.collection('contactMessages').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) throw new ApiError(404, 'Message not found');

  await ref.update({ status: 'read' });
  res.json({ id: doc.id, ...doc.data(), status: 'read' });
};

export const deleteContactMessage = async (req, res) => {
  const ref = db.collection('contactMessages').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) throw new ApiError(404, 'Message not found');

  await ref.delete();
  res.json({ message: 'Message deleted successfully' });
};
