import jwt from 'jsonwebtoken';
import { adminFirestore } from '../config/firebase.js';
import { ApiError } from '../utils/apiError.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) throw new ApiError(401, 'Not authorized');

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  const db = adminFirestore();
  const userDoc = await db.collection('users').doc(decoded.id).get();
  
  if (!userDoc.exists) throw new ApiError(401, 'User no longer exists');
  
  const user = { id: userDoc.id, ...userDoc.data() };
  if (user.isDeleted) throw new ApiError(401, 'Account deleted');
  if (user.isBanned) throw new ApiError(403, 'Your account is banned');
  
  req.user = user;
  next();
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) throw new ApiError(403, 'Access denied');
  next();
};
