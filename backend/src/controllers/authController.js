import { adminFirestore, adminAuth } from '../config/firebase.js';
import { generateToken } from '../utils/generateToken.js';
import { notifyAdmins } from '../utils/notificationHelper.js';
import { ApiError } from '../utils/apiError.js';
import bcrypt from 'bcryptjs';

const authResponse = (userData, id) => {
  const user = { ...userData, id };
  delete user.password;
  return {
    ...user,
    token: generateToken(user),
  };
};

const createUserObject = (data) => ({
  name: data.name,
  email: data.email.toLowerCase(),
  password: data.password || '',
  role: data.role || 'beginner_reader',
  socialProvider: data.socialProvider || 'local',
  badges: {
    author: data.role === 'author',
    verifiedAuthor: false,
    proWriter: false,
    pro: false,
    owner: data.email === 'liyamu.owner@gmail.com',
    proReader: false,
    ...data.badges
  },
  isPro: false,
  creditBalance: 0,
  earningsBalance: 0,
  isBanned: false,
  isDeleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  wishlist: [],
  bookmarkedWorks: [],
  purchasedBooks: [],
  readingHistory: [],
  following: [],
  followersCount: 0,
  socialLinks: { facebook: '', whatsapp: '', telegram: '' },
  settings: { theme: 'light' }
});

export const register = async (req, res) => {
  const { name, email, password, role, firebaseUid } = req.body;
  if (!name || !email || !password || !firebaseUid) throw new ApiError(400, 'Missing required fields (including firebaseUid)');

  const db = adminFirestore();
  const usersRef = db.collection('users');
  
  // Check if email exists (Firestore query)
  const existing = await usersRef.where('email', '==', email.toLowerCase()).limit(1).get();
  if (!existing.empty) throw new ApiError(400, 'Email already exists');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = createUserObject({ 
    name, 
    email, 
    password: hashedPassword, 
    role: role === 'author' ? 'author' : 'beginner_reader' 
  });

  await usersRef.doc(firebaseUid).set(newUser);
  
  // Notify Admins
  await notifyAdmins({
    title: 'New Member Joined',
    message: `${name} has joined LIYAMU.`,
    type: 'info',
    metadata: { action_type: 'user_join', name, email, provider: 'Local' }
  });

  res.status(201).json(authResponse(newUser, firebaseUid));
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const db = adminFirestore();
  const snapshot = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
  
  if (snapshot.empty) throw new ApiError(401, 'Invalid credentials');
  
  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();
  
  if (userData.socialProvider !== 'local') throw new ApiError(400, 'Please login with social provider');
  if (userData.isBanned) throw new ApiError(403, 'This account is banned');
  if (userData.isDeleted) throw new ApiError(401, 'Account deleted');

  const isMatch = await bcrypt.compare(password, userData.password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  res.json(authResponse(userData, userDoc.id));
};

export const socialLogin = async (req, res) => {
  const { email, name, provider, role, firebaseUid } = req.body;
  if (!email || !name || !provider || !firebaseUid) throw new ApiError(400, 'Missing social login data or firebaseUid');

  const db = adminFirestore();
  const userRef = db.collection('users').doc(firebaseUid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    // Check if email already used by local account
    const existingEmail = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get();
    if (!existingEmail.empty) throw new ApiError(400, 'Email already associated with another account');

    const newUser = createUserObject({
      name,
      email,
      socialProvider: provider,
      role: role === 'author' ? 'author' : 'beginner_reader'
    });

    await userRef.set(newUser);
    return res.json(authResponse(newUser, firebaseUid));
  }

  const userData = userDoc.data();
  if (userData.isBanned) throw new ApiError(403, 'This account is banned');
  if (userData.isDeleted) throw new ApiError(401, 'Account deleted');

  res.json(authResponse(userData, firebaseUid));
};

export const me = async (req, res) => {
  res.json(req.user);
};

