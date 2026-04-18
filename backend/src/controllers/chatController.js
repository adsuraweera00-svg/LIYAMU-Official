import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';

export const sendMessage = async (req, res) => {
  const { message, recipientId } = req.body;
  if (!message) throw new ApiError(400, 'Message is required');

  let chat;
  if (req.user.role === 'admin') {
    if (!recipientId) throw new ApiError(400, 'Recipient ID is required for admins');
    chat = await ChatMessage.create({
      user: recipientId,
      admin: req.user._id,
      sender: 'admin',
      message
    });

    await Notification.create({
      user: recipientId,
      title: 'New message from Admin',
      message: 'An administrator has responded to your inquiry.',
      type: 'user'
    });
  } else {
    chat = await ChatMessage.create({
      user: req.user._id,
      sender: 'user',
      message
    });

    // Optionally notify all admins
    const admins = await User.find({ role: 'admin' });
    await Promise.all(admins.map(admin => 
      Notification.create({
        user: admin._id,
        title: 'New Support Message',
        message: `User ${req.user.name} sent a new message.`,
        type: 'user'
      })
    ));
  }

  res.status(201).json(chat);
};

export const getMyChatHistory = async (req, res) => {
  const messages = await ChatMessage.find({ user: req.user._id }).sort({ createdAt: 1 });
  res.json(messages);
};

export const getAdminChats = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    // Get all unique users who have sent messages
    const distinctUsers = await ChatMessage.distinct('user');
    const userDetails = await User.find({ _id: { $in: distinctUsers } }).select('name email role');
    return res.json(userDetails);
  }

  const messages = await ChatMessage.find({ user: userId }).sort({ createdAt: 1 });
  res.json(messages);
};

export const markAsRead = async (req, res) => {
  const { userId } = req.params; // If admin, mark all messages from this user as read
  const query = req.user.role === 'admin' 
    ? { user: userId, sender: 'user', isRead: false }
    : { user: req.user._id, sender: 'admin', isRead: false };

  await ChatMessage.updateMany(query, { isRead: true });
  res.json({ success: true });
};
