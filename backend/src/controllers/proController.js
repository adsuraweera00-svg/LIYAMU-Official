import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';

export const upgradeToPro = async (req, res) => {
  const { type } = req.body; // '1m', '3m', '1y'
  if (!['1m', '3m', '1y'].includes(type) ) {
    throw new ApiError(400, 'Invalid subscription type');
  }

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');

  const costs = {
    '1m': 1000,
    '3m': 2500,
    '1y': 8000
  };

  if (user.creditBalance < costs[type]) {
    throw new ApiError(400, 'Insufficient credits to upgrade.');
  }

  user.creditBalance -= costs[type];

  // Define durations
  const durations = {
    '1m': 30 * 24 * 60 * 60 * 1000,
    '3m': 90 * 24 * 60 * 60 * 1000,
    '1y': 365 * 24 * 60 * 60 * 1000
  };

  const now = new Date();
  const currentExpiry = user.proExpiryDate && user.proExpiryDate > now ? user.proExpiryDate.getTime() : now.getTime();
  
  user.isPro = true;
  user.proType = type;
  user.proExpiryDate = new Date(currentExpiry + durations[type]);
  
  if (!user.badges) {
    user.badges = {};
  }
  user.badges.pro = true;
  
  await user.save();

  await Notification.create({
    user: user._id,
    title: 'Welcome to Pro!',
    message: `Payment successful! You now have access to Pro benefits until ${user.proExpiryDate.toLocaleDateString()}. You can now list books with a price.`,
    type: 'purchase'
  });

  res.json({ success: true, user });
};

export const getProStatus = async (req, res) => {
  const user = await User.findById(req.user._id).select('isPro proExpiryDate proType');
  res.json(user);
};
