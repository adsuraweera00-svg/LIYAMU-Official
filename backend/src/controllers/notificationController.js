import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications);
};

export const markRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification || String(notification.user) !== String(req.user._id)) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  notification.isRead = true;
  await notification.save();
  res.json(notification);
};

export const markAllRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );
  res.json({ message: 'All notifications marked as read' });
};

export const deleteNotification = async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification || String(notification.user) !== String(req.user._id)) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  await notification.deleteOne();
  res.json({ message: 'Notification deleted' });
};
