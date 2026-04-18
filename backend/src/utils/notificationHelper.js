import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendAdminAlert, formatTelegramMessage } from './telegram.js';

/**
 * Notifies all administrators and sends a single synchronized Telegram alert.
 */
export const notifyAdmins = async ({ title, message, type = 'info', metadata = {} }) => {
  const admins = await User.find({ role: 'admin' });
  if (admins.length === 0) return;

  // 1. Send ONE Telegram alert (using the first admin's notification as a template)
  const telegramMessage = formatTelegramMessage({ title, message, metadata });
  sendAdminAlert(telegramMessage).catch(err => console.error('Telegram alert failed:', err));

  // 2. Create DB notifications for ALL admins
  // We add a flag 'telegramSent: true' to metadata to prevent the global hook from double-sending
  const notificationPromises = admins.map(admin => Notification.create({
    user: admin._id,
    title,
    message,
    type,
    metadata: { ...metadata, telegramSent: true }
  }));

  await Promise.all(notificationPromises);
};

/**
 * Standard trigger for single users
 */
export const triggerNotification = async ({ userId, title, message, type = 'info', metadata = {} }) => {
  return await Notification.create({ user: userId, title, message, type, metadata });
};
