import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { notifyAdmins } from '../utils/notificationHelper.js';
import { ApiError } from '../utils/apiError.js';

// Create a payout request (Author)
export const createPayoutRequest = async (req, res) => {
  const { amount, bankDetails } = req.body;
  const user = await User.findById(req.user._id);

  // 1. Logic: Only "Pro" Authors
  // isPro is Boolean; role also implies certain types.
  const isEligible = user.isPro || ['pro_writer', 'verified_author'].includes(user.role);
  if (!isEligible) throw new ApiError(403, 'Payouts are only available for Pro authors.');
  // 1.5 Minimum Payout Check
  if (amount < 200) throw new ApiError(400, 'Minimum payout amount is 200 credits.');

  // 2. Sufficient Balance (Unified)
  const totalBalance = (user.creditBalance || 0) + (user.earningsBalance || 0);
  if (totalBalance < amount) {
    throw new ApiError(400, `Insufficient balance. Your total platform balance is ${totalBalance.toFixed(2)} credits.`);
  }

  // 3. Calculate Fee (2%)
  const feeAmount = Math.floor(amount * 0.02 * 100) / 100; // 2% fee
  const netAmount = amount - feeAmount;

  // 4. Create Request and deduct balance
  const withdrawal = await Withdrawal.create({
    user: user._id,
    amount,
    feeAmount,
    netAmount,
    bankDetails,
  });

  // Split Deduction logic
  let remainingToDeduct = amount;
  if (user.earningsBalance >= remainingToDeduct) {
    user.earningsBalance -= remainingToDeduct;
  } else {
    remainingToDeduct -= user.earningsBalance;
    user.earningsBalance = 0;
    user.creditBalance -= remainingToDeduct;
  }
  
  await user.save();

  // 4. Create notifications for all admins (triggers global Telegram hook)
  await notifyAdmins({
    title: 'New Payout Request',
    message: `${user.name} has requested a payout of ${amount} credits.`,
    type: 'warning',
    metadata: {
      action_type: 'payout_request',
      username: user.name,
      amount: amount,
      method: 'Bank Transfer'
    }
  });

  res.status(201).json(withdrawal);
};

// Get current author's history
export const getMyRequests = async (req, res) => {
  const requests = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(requests);
};

// Get all requests (Admin)
export const getAdminRequests = async (req, res) => {
  const requests = await Withdrawal.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(requests);
};

// Update request status (Admin)
export const updatePayoutStatus = async (req, res) => {
  const { status, rejectionReason } = req.body;
  const withdrawal = await Withdrawal.findById(req.params.id);
  if (!withdrawal) throw new ApiError(404, 'Request not found');

  if (status === 'completed') {
    if (!req.file) throw new ApiError(400, 'Please upload the transfer confirmation slip.');
    withdrawal.payoutSlip = `/uploads/${req.file.filename}`;
    withdrawal.status = 'completed';
  } else if (status === 'rejected') {
    if (!rejectionReason) throw new ApiError(400, 'Please provide a reason for rejection.');
    withdrawal.status = 'rejected';
    withdrawal.rejectionReason = rejectionReason;

    // 5. Refund coins on rejection
    const user = await User.findById(withdrawal.user);
    if (user) {
      user.earningsBalance += withdrawal.amount;
      await user.save();
    }
  }

  await withdrawal.save();

  // Re-populate user for frontend consistency
  const updatedWithdrawal = await Withdrawal.findById(withdrawal._id).populate('user', 'name email');

  // 6. Notify Author
  await Notification.create({
    user: withdrawal.user,
    title: `Payout ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: status === 'completed' 
      ? `Your payout of ${withdrawal.amount} credits has been processed successfully. View the slip for details.`
      : `Your payout request was rejected. ${withdrawal.amount} credits have been refunded. Reason: ${rejectionReason}`,
    type: 'user'
  });

  res.json(updatedWithdrawal);
};

// Delete a payout request (Admin)
export const deletePayoutRequest = async (req, res) => {
  const withdrawal = await Withdrawal.findById(req.params.id);
  if (!withdrawal) throw new ApiError(404, 'Request not found');

  await Withdrawal.findByIdAndDelete(req.params.id);
  res.json({ message: 'Payout record deleted successfully' });
};
