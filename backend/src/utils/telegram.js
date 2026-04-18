/**
 * Telegram Bot Utility
 * Handles sending administrative alerts to a specified Telegram channel.
 */

export const sendAdminAlert = async (message) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Telegram Bot credentials not configured. Skipping alert.');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('Telegram API Error:', data.description);
    }
  } catch (error) {
    console.error('Failed to send Telegram alert:', error.message);
  }
};

/**
 * Generates a styled Telegram template based on the notification type and metadata.
 */
export const formatTelegramMessage = (doc) => {
  const { title, message, metadata = {} } = doc;
  const type = metadata.action_type || 'generic';

  const footer = `\n⚡ <b>Stay responsive and keep your users engaged!</b>`;

  switch (type) {
    case 'contact_inquiry':
      return `🔔 <b>ADMIN ALERT: ${title}</b>\n\n` +
             `📩 <b>You’ve Got a New Message!</b>\n` +
             `A new inquiry has just been submitted through your system.\n\n` +
             `👤 <b>Sender Name:</b> ${metadata.username || 'N/A'}\n` +
             `📧 <b>Email Address:</b> ${metadata.useremail || 'N/A'}\n\n` +
             `📝 <b>Message Details:</b> ${metadata.inquiryMessage || message}\n` +
             footer;

    case 'user_join':
      return `👤 <b>SYSTEM ALERT: New User Join</b>\n\n` +
             `🎉 <b>A new member just joined LIYAMU!</b>\n\n` +
             `👤 <b>Name:</b> ${metadata.name}\n` +
             `📧 <b>Email:</b> ${metadata.email}\n` +
             `🔗 <b>Provider:</b> ${metadata.provider || 'Local'}\n` +
             footer;

    case 'book_submission':
      return `📚 <b>CONTENT ALERT: Book Submission</b>\n\n` +
             `📖 <b>A new book is waiting for your review.</b>\n\n` +
             `📕 <b>Title:</b> ${metadata.title}\n` +
             `✍️ <b>Author:</b> ${metadata.authorName}\n` +
             `📂 <b>Category:</b> ${metadata.category}\n` +
             footer;

    case 'creative_submission':
      return `🎨 <b>SYSTEM ALERT: Creative Corner</b>\n\n` +
             `🖌️ <b>New content posted in the Creative Corner.</b>\n\n` +
             `📜 <b>Title:</b> ${metadata.title}\n` +
             `👤 <b>Artist:</b> ${metadata.authorName}\n` +
             `🏷️ <b>Type:</b> ${metadata.category}\n` +
             footer;

    case 'kyc_submission':
      return `🆔 <b>ADMIN ALERT: KYC Verification</b>\n\n` +
             `📄 <b>A user has submitted identity documents for approval.</b>\n\n` +
             `👤 <b>Name:</b> ${metadata.name}\n` +
             `🪪 <b>ID Number:</b> ${metadata.idNumber}\n` +
             footer;

    case 'payout_request':
      return `💰 <b>FAINANCE ALERT: Payout Request</b>\n\n` +
             `💸 <b>A new withdrawal request needs your attention.</b>\n\n` +
             `👤 <b>User:</b> ${metadata.username}\n` +
             `💵 <b>Amount:</b> ${metadata.amount} credits\n` +
             `🏦 <b>Method:</b> ${metadata.method || 'Bank Transfer'}\n` +
             footer;
    
    case 'book_review':
      return `⭐ <b>SOCIAL ALERT: New Review</b>\n\n` +
             `🗣️ <b>A user just shared their thoughts on a book.</b>\n\n` +
             `📕 <b>Book:</b> ${metadata.bookTitle}\n` +
             `👤 <b>Reviewer:</b> ${metadata.reviewerName}\n` +
             `🌟 <b>Rating:</b> ${metadata.rating}/5 stars\n` +
             footer;

    default:
      return `🔔 <b>ADMIN ALERT: ${title}</b>\n\n` +
             `📝 <b>Notification Details:</b>\n${message}\n\n` +
             `⚡ <b>Check your admin dashboard for more info.</b>`;
  }
};
