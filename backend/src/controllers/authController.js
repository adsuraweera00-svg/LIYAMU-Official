import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { notifyAdmins } from '../utils/notificationHelper.js';
import { ApiError } from '../utils/apiError.js';

const authResponse = (user) => {
  const userObj = user.toObject();
  delete userObj.password;
  return {
    ...userObj,
    token: generateToken(user),
  };
};

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) throw new ApiError(400, 'Please fill all required fields');

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, 'Email already exists');

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'author' ? 'author' : 'reader',
    badges: { author: role === 'author' },
  });

  // Notify Admins
  await notifyAdmins({
    title: 'New Member Joined',
    message: `${name} has joined LIYAMU.`,
    type: 'info',
    metadata: {
      action_type: 'user_join',
      name,
      email,
      provider: 'Local'
    }
  });

  res.status(201).json(authResponse(user));
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) throw new ApiError(401, 'Invalid credentials');
  if (user.isBanned) throw new ApiError(403, 'This account is banned');
  res.json(authResponse(user));
};

export const socialLogin = async (req, res) => {
  const { email, name, provider, role } = req.body;
  if (!email || !name || !provider) throw new ApiError(400, 'Missing social login data');

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      password: Math.random().toString(36).slice(-10) + 'Aa1!',
      role: role === 'author' ? 'author' : 'reader',
      socialProvider: provider,
      badges: { author: role === 'author' },
    });
  }

  res.json(authResponse(user));
};

export const me = async (req, res) => {
  res.json(req.user);
};
