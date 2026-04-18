import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';
import Notification from '../models/Notification.js';
import CreditRequest from '../models/CreditRequest.js';
import { ApiError } from '../utils/apiError.js';

export const buyCredits = async (req, res) => {
  const { amount, packageId, paymentId } = req.body;
  if (!amount || amount <= 0) throw new ApiError(400, 'Invalid amount');

  // Logic: In a real app, verify paymentId via Stripe/PayPal
  // For now, simulate success
  
  const user = await User.findById(req.user._id);
  user.creditBalance += amount;
  await user.save();

  await CreditTransaction.create({
    user: user._id,
    type: 'purchase',
    amount: amount,
    description: `Purchased ${amount} Credits (Package ID: ${packageId || 'custom'})`,
    metadata: { packageId, paymentId }
  });

  // Notify Admins
  const admins = await User.find({ role: 'admin' });
  await Notification.insertMany(admins.map(admin => ({
    user: admin._id,
    title: 'Credit Purchase Alert',
    message: `${user.name} purchased ${amount} credits. Package: ${packageId}`,
    type: 'admin_alert'
  })));

  res.json({ success: true, balance: user.creditBalance });
};

export const adjustCredits = async (req, res) => {
  const { userId, amount, type, reason } = req.body;
  if (!['admin_add', 'admin_remove'].includes(type)) throw new ApiError(400, 'Invalid adjustment type');
  if (!userId || !amount) throw new ApiError(400, 'Missing user ID or amount');

  const targetUser = await User.findById(userId);
  if (!targetUser) throw new ApiError(404, 'User not found');

  if (type === 'admin_add') {
    targetUser.creditBalance += amount;
  } else {
    targetUser.creditBalance = Math.max(0, targetUser.creditBalance - amount);
  }
  
  await targetUser.save();

  await CreditTransaction.create({
    user: targetUser._id,
    type: type,
    amount: amount,
    description: reason || `Admin adjustment (${type})`,
    metadata: { adminNote: reason }
  });

  await Notification.create({
    user: targetUser._id,
    title: 'Wallet Balance Adjusted',
    message: `Your credit balance was updated by an administrator: ${reason}`,
    type: 'info'
  });

  res.json({ success: true, balance: targetUser.creditBalance });
};

export const getMyTransactions = async (req, res) => {
  const transactions = await CreditTransaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(transactions);
};

export const getAllTransactions = async (req, res) => {
  const transactions = await CreditTransaction.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(transactions);
};

// --- Manual Credit Request System ---

export const submitCreditRequest = async (req, res) => {
  const { amount, packageId, price } = req.body;
  if (!req.file) throw new ApiError(400, 'Payment slip is required');
  if (!amount || !price) throw new ApiError(400, 'Invalid amount or price');

  const slipUrl = req.file.path.startsWith('http') 
    ? req.file.path 
    : `/uploads/${req.file.filename}`;

  const request = await CreditRequest.create({
    user: req.user._id,
    packageId: packageId || 'custom',
    amount: parseInt(amount),
    price: parseFloat(price),
    slipUrl,
    status: 'pending'
  });

  // Notify Admins
  const admins = await User.find({ role: 'admin' });
  await Notification.insertMany(admins.map(admin => ({
    user: admin._id,
    title: 'New Credit Purchase Request',
    message: `${req.user.name} submitted a slip for ${amount} Credits.`,
    type: 'admin_alert',
    link: `/dashboard/admin/credits?request=${request._id}`
  })));

  res.json({ 
    success: true, 
    message: 'Your coins will be added to your account within 24 hours',
    request 
  });
};

export const getMyRequests = async (req, res) => {
  const requests = await CreditRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(requests);
};

export const getAllCreditRequests = async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  
  const requests = await CreditRequest.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: 1 }); // Oldest first as requested

  res.json(requests);
};

export const processCreditRequest = async (req, res) => {
  const { requestId, status, adminNote } = req.body;
  if (!['approved', 'rejected'].includes(status)) throw new ApiError(400, 'Invalid status');

  const request = await CreditRequest.findById(requestId).populate('user');
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.status !== 'pending') throw new ApiError(400, 'Request already processed');

  request.status = status;
  request.adminNote = adminNote;
  await request.save();

  if (status === 'approved') {
    const user = request.user;
    user.creditBalance += request.amount;
    await user.save();

    await CreditTransaction.create({
      user: user._id,
      type: 'purchase',
      amount: request.amount,
      description: `Approved Purchase: ${request.amount} Credits`,
      metadata: { requestId: request._id, packageId: request.packageId }
    });

    await Notification.create({
      user: user._id,
      title: 'Credit Purchase Approved',
      message: `Your purchase of ${request.amount} credits has been approved! You can now spend them on your favorite books.`,
      type: 'success'
    });
  } else {
    await Notification.create({
      user: request.user._id,
      title: 'Credit Purchase Rejected',
      message: `Your purchase request was rejected. Reason: ${adminNote || 'No explanation provided'}.`,
      type: 'error'
    });
  }

  res.json({ success: true, request });
};
