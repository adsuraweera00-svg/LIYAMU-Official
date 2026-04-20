import { adminFirestore, FieldValue } from '../config/firebase.js';
import { ApiError } from '../utils/apiError.js';

const db = adminFirestore();

export const buyCredits = async (req, res) => {
  const { amount, packageId, paymentId } = req.body;
  if (!amount || amount <= 0) throw new ApiError(400, 'Invalid amount');

  
  const userRef = db.collection('users').doc(req.user.id);
  
  await userRef.update({
    creditBalance: FieldValue.increment(amount)
  });

  const transactionData = {
    user: req.user.id,
    type: 'purchase',
    amount: amount,
    description: `Purchased ${amount} Credits (Package ID: ${packageId || 'custom'})`,
    metadata: { packageId, paymentId },
    createdAt: new Date().toISOString()
  };

  await db.collection('creditTransactions').add(transactionData);

  // Notify Admins
  const adminsSnapshot = await db.collection('users').where('role', '==', 'admin').get();
  const batch = db.batch();
  adminsSnapshot.forEach(doc => {
    const notifRef = db.collection('notifications').doc();
    batch.set(notifRef, {
      user: doc.id,
      title: 'Credit Purchase Alert',
      message: `${req.user.name} purchased ${amount} credits.`,
      type: 'admin_alert',
      createdAt: new Date().toISOString(),
      read: false
    });
  });
  await batch.commit();

  const updatedUser = await userRef.get();
  res.json({ success: true, balance: updatedUser.data().creditBalance });
};

export const adjustCredits = async (req, res) => {
  const { userId, amount, type, reason } = req.body;
  if (!['admin_add', 'admin_remove'].includes(type)) throw new ApiError(400, 'Invalid adjustment type');
  if (!userId || !amount) throw new ApiError(400, 'Missing user ID or amount');

  
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) throw new ApiError(404, 'User not found');

  const adj = type === 'admin_add' ? amount : -amount;
  await userRef.update({
    creditBalance: FieldValue.increment(adj)
  });

  await db.collection('creditTransactions').add({
    user: userId,
    type: type,
    amount: amount,
    description: reason || `Admin adjustment (${type})`,
    metadata: { adminNote: reason },
    createdAt: new Date().toISOString()
  });

  await db.collection('notifications').add({
    user: userId,
    title: 'Wallet Balance Adjusted',
    message: `Your balance was updated by an admin: ${reason}`,
    type: 'info',
    createdAt: new Date().toISOString(),
    read: false
  });

  const updated = await userRef.get();
  res.json({ success: true, balance: updated.data().creditBalance });
};

export const getMyTransactions = async (req, res) => {
  const snapshot = await db.collection('creditTransactions')
    .where('user', '==', req.user.id)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};

export const getAllTransactions = async (req, res) => {
  const snapshot = await db.collection('creditTransactions')
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get();

  const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const userIds = [...new Set(transactions.map(t => t.user))];
  const users = {};
  if (userIds.length > 0) {
    const userSnapshot = await db.collection('users').where('__name__', 'in', userIds).get();
    userSnapshot.forEach(doc => { users[doc.id] = doc.data(); });
  }

  res.json(transactions.map(t => ({
    ...t,
    user: { id: t.user, name: users[t.user]?.name, email: users[t.user]?.email }
  })));
};

export const submitCreditRequest = async (req, res) => {
  const { amount, packageId, price } = req.body;
  if (!req.file) throw new ApiError(400, 'Payment slip is required');
  if (!amount || !price) throw new ApiError(400, 'Invalid data');

  const slipUrl = req.file.path.startsWith('http') 
    ? req.file.path 
    : `/uploads/${req.file.filename}`;

  const requestData = {
    user: req.user.id,
    packageId: packageId || 'custom',
    amount: parseInt(amount),
    price: parseFloat(price),
    slipUrl,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const docRef = await db.collection('creditRequests').add(requestData);

  const adminsSnapshot = await db.collection('users').where('role', '==', 'admin').get();
  const batch = db.batch();
  adminsSnapshot.forEach(doc => {
    const notifRef = db.collection('notifications').doc();
    batch.set(notifRef, {
      user: doc.id,
      title: 'New Credit Request',
      message: `${req.user.name} submitted a slip for ${amount} Credits.`,
      type: 'admin_alert',
      createdAt: new Date().toISOString(),
      read: false
    });
  });
  await batch.commit();

  res.json({ success: true, message: 'Processing...', id: docRef.id });
};

export const getMyRequests = async (req, res) => {
  const snapshot = await db.collection('creditRequests')
    .where('user', '==', req.user.id)
    .orderBy('createdAt', 'desc')
    .get();
  res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};

export const getAllCreditRequests = async (req, res) => {
  const { status } = req.query;
  let query = db.collection('creditRequests');
  if (status) query = query.where('status', '==', status);
  
  const snapshot = await query.orderBy('createdAt', 'asc').get();
  const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const userIds = [...new Set(requests.map(r => r.user))];
  const users = {};
  if (userIds.length > 0) {
    const userSnapshot = await db.collection('users').where('__name__', 'in', userIds).get();
    userSnapshot.forEach(doc => { users[doc.id] = doc.data(); });
  }

  res.json(requests.map(r => ({ ...r, user: { id: r.user, name: users[r.user]?.name, email: users[r.user]?.email } })));
};

export const processCreditRequest = async (req, res) => {
  const { requestId, status, adminNote } = req.body;
  if (!['approved', 'rejected'].includes(status)) throw new ApiError(400, 'Invalid status');

  const ref = db.collection('creditRequests').doc(requestId);
  const doc = await ref.get();
  if (!doc.exists) throw new ApiError(404, 'Request not found');
  if (doc.data().status !== 'pending') throw new ApiError(400, 'Already processed');

  
  await ref.update({ status, adminNote, updatedAt: new Date().toISOString() });

  const userId = doc.data().user;
  if (status === 'approved') {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({ 
      creditBalance: FieldValue.increment(doc.data().amount) 
    });

    await db.collection('creditTransactions').add({
      user: userId,
      type: 'purchase',
      amount: doc.data().amount,
      description: `Approved Credit Request`,
      createdAt: new Date().toISOString()
    });

    await db.collection('notifications').add({
      user: userId,
      title: 'Purchase Approved',
      message: `Your request for ${doc.data().amount} credits was approved!`,
      type: 'success',
      createdAt: new Date().toISOString(),
      read: false
    });
  } else {
    await db.collection('notifications').add({
      user: userId,
      title: 'Purchase Rejected',
      message: `Your request was rejected. Reason: ${adminNote || 'N/A'}`,
      type: 'error',
      createdAt: new Date().toISOString(),
      read: false
    });
  }

  res.json({ success: true });
};
