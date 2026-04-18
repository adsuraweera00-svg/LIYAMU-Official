import mongoose from 'mongoose';
import User from './User.js';
import { sendAdminAlert } from '../utils/telegram.js';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'info' },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

notificationSchema.post('save', async function (doc) {
  try {
    // Skip if already sent to telegram via notifyAdmins helper or other means
    if (doc.metadata && doc.metadata.telegramSent) return;

    const user = await User.findById(doc.user);
    if (user && user.role === 'admin') {
      const { formatTelegramMessage } = await import('../utils/telegram.js');
      const telegramMessage = formatTelegramMessage(doc);
      sendAdminAlert(telegramMessage).catch(err => console.error('Global Telegram alert failed:', err));
    }
  } catch (err) {
    console.error('Notification hook error:', err);
  }
});

export default mongoose.model('Notification', notificationSchema);
