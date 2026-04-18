import ContactMessage from '../models/ContactMessage.js';
import { notifyAdmins } from '../utils/notificationHelper.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const createContactMessage = async (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newMessage = await ContactMessage.create({ name, email, message });

  // Create notifications for all admins (triggers global Telegram hook)
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

  res.status(201).json(newMessage);
};

export const getContactMessages = async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(messages);
};

export const markAsRead = async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status: 'read' },
    { new: true }
  );
  if (!message) return res.status(404).json({ message: 'Message not found' });
  res.json(message);
};

export const deleteContactMessage = async (req, res) => {
  const message = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!message) return res.status(404).json({ message: 'Message not found' });
  res.json({ message: 'Message deleted successfully' });
};
