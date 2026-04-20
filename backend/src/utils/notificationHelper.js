import { adminFirestore } from '../config/firebase.js';
import { sendAdminAlert, formatTelegramMessage } from './telegram.js';

const db = adminFirestore();

/**
 * Notifies all administrators and sends a synchronized Telegram alert.
 */
export const notifyAdmins = async ({ title, message, type = 'info', metadata = {} }) => {
  const adminsSnapshot = await db.collection('users').where('role', '==', 'admin').get();
  if (adminsSnapshot.empty) return;

  // 1. Send ONE Telegram alert
  const telegramMessage = formatTelegramMessage({ title, message, metadata });
  sendAdminAlert(telegramMessage).catch(err => console.error('Telegram alert failed:', err));

  // 2. Create DB notifications for ALL admins in a batch
  const batch = db.batch();
  adminsSnapshot.forEach(doc => {
    const notifRef = db.collection('notifications').doc();
    batch.set(notifRef, {
      user: doc.id,
      title,
      message,
      type,
      metadata: { ...metadata, telegramSent: true },
      createdAt: new Date().toISOString(),
      read: false
    });
  });

  await batch.commit();
};

/**
 * Standard trigger for single users
 */
export const triggerNotification = async ({ userId, title, message, type = 'info', metadata = {} }) => {
  return await db.collection('notifications').add({
    user: userId,
    title,
    message,
    type,
    metadata,
    createdAt: new Date().toISOString(),
    read: false
  });
};
