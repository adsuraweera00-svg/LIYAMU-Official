import { adminFirestore, FieldValue } from '../config/firebase.js';
import { notifyAdmins } from '../utils/notificationHelper.js';
import { ApiError } from '../utils/apiError.js';

const db = adminFirestore();

export const createPayoutRequest = async (req, res) => {
  const { amount, bankDetails } = req.body;
  const userRef = db.collection('users').doc(req.user.id);
  const userDoc = await userRef.get();
  const userData = userDoc.data();

  const isEligible = userData.isPro || ['pro_writer', 'verified_author'].includes(userData.role);
  if (!isEligible) throw new ApiError(403, 'Payouts are for Pro authors.');
  if (amount < 200) throw new ApiError(400, 'Minimum payout is 200 credits.');

  const totalBalance = (userData.creditBalance || 0) + (userData.earningsBalance || 0);
  if (totalBalance < amount) throw new ApiError(400, `Insufficient balance.`);

  const feeAmount = Math.floor(amount * 0.02 * 100) / 100;
  const netAmount = amount - feeAmount;

  const requestData = {
    user: req.user.id,
    amount,
    feeAmount,
    netAmount,
    bankDetails,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const docRef = await db.collection('withdrawals').add(requestData);

  // Deduct logic
  let rem = amount;
  let newEB = userData.earningsBalance || 0;
  let newCB = userData.creditBalance || 0;

  if (newEB >= rem) { newEB -= rem; } 
  else { rem -= newEB; newEB = 0; newCB -= rem; }

  await userRef.update({ earningsBalance: newEB, creditBalance: newCB });

  await notifyAdmins({
    title: 'New Payout Request',
    message: `${userData.name} requested ${amount} credits.`,
    type: 'warning',
    metadata: { action_type: 'payout_request', username: userData.name, amount }
  });

  res.status(201).json({ id: docRef.id, ...requestData });
};

export const getMyRequests = async (req, res) => {
  const snapshot = await db.collection('withdrawals')
    .where('user', '==', req.user.id)
    .orderBy('createdAt', 'desc')
    .get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};

export const getAdminRequests = async (req, res) => {
  const snapshot = await db.collection('withdrawals').orderBy('createdAt', 'desc').get();
  const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const userIds = [...new Set(requests.map(r => r.user))];
  const users = {};
  if (userIds.length > 0) {
    const userSnapshot = await db.collection('users').where('__name__', 'in', userIds).get();
    userSnapshot.forEach(doc => { users[doc.id] = doc.data(); });
  }

  res.json(requests.map(r => ({ ...r, user: { id: r.user, name: users[r.user]?.name, email: users[r.user]?.email } })));
};

export const updatePayoutStatus = async (req, res) => {
  const { status, rejectionReason } = req.body;
  const ref = db.collection('withdrawals').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) throw new ApiError(404, 'Request not found');

  const updates = { status, updatedAt: new Date().toISOString() };
  if (status === 'completed') {
    if (!req.file) throw new ApiError(400, 'Upload payout slip.');
    updates.payoutSlip = `/uploads/${req.file.filename}`;
  } else if (status === 'rejected') {
    if (!rejectionReason) throw new ApiError(400, 'Reason required.');
    updates.rejectionReason = rejectionReason;

    await db.collection('users').doc(doc.data().user).update({
      earningsBalance: FieldValue.increment(doc.data().amount)
    });
  }

  await ref.update(updates);
  
  await db.collection('notifications').add({
    user: doc.data().user,
    title: `Payout ${status}`,
    message: status === 'completed' ? 'Processed!' : `Rejected: ${rejectionReason}`,
    type: 'user',
    createdAt: new Date().toISOString(),
    read: false
  });

  const updatedDoc = await ref.get();
  res.json({ id: updatedDoc.id, ...updatedDoc.data() });
};

export const deletePayoutRequest = async (req, res) => {
  const ref = db.collection('withdrawals').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) throw new ApiError(404, 'Request not found');
  await ref.delete();
  res.json({ message: 'Deleted' });
};
