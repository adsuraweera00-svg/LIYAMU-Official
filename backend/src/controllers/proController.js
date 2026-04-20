import { adminFirestore } from '../config/firebase.js';
import { ApiError } from '../utils/apiError.js';

const db = adminFirestore();

export const upgradeToPro = async (req, res) => {
  const { type } = req.body;
  if (!['1m', '3m', '1y'].includes(type)) throw new ApiError(400, 'Invalid subscription type');

  const userRef = db.collection('users').doc(req.user.id);
  const userDoc = await userRef.get();
  const userData = userDoc.data();

  const costs = { '1m': 1000, '3m': 2500, '1y': 8000 };
  if ((userData.creditBalance || 0) < costs[type]) throw new ApiError(400, 'Insufficient credits.');

  const durations = {
    '1m': 30 * 24 * 60 * 60 * 1000,
    '3m': 90 * 24 * 60 * 60 * 1000,
    '1y': 365 * 24 * 60 * 60 * 1000
  };

  const now = Date.now();
  const currentExpiry = (userData.proExpiryDate && new Date(userData.proExpiryDate).getTime() > now) 
    ? new Date(userData.proExpiryDate).getTime() 
    : now;
  
  const newExpiry = new Date(currentExpiry + durations[type]).toISOString();

  await userRef.update({
    creditBalance: (userData.creditBalance || 0) - costs[type],
    isPro: true,
    proType: type,
    proExpiryDate: newExpiry,
    'badges.pro': true
  });

  await db.collection('notifications').add({
    user: req.user.id,
    title: 'Welcome to Pro!',
    message: `Payment successful! Pro active until ${new Date(newExpiry).toLocaleDateString()}.`,
    type: 'purchase',
    createdAt: new Date().toISOString(),
    read: false
  });

  const updated = await userRef.get();
  res.json({ success: true, user: { id: updated.id, ...updated.data() } });
};

export const getProStatus = async (req, res) => {
  const doc = await db.collection('users').doc(req.user.id).get();
  const d = doc.data();
  res.json({ isPro: d.isPro, proExpiryDate: d.proExpiryDate, proType: d.proType });
};
