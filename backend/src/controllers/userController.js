import mongoose from 'mongoose';
import User from '../models/User.js';
import Book from '../models/Book.js';
import VerificationRequest from '../models/VerificationRequest.js';
import Notification from '../models/Notification.js';

export const updateProfile = async (req, res) => {
  const { name, email, phone, bio, theme, socialLinks } = req.body;
  
  if (email && email !== req.user.email) {
    // Prevent changing the owner email
    if (req.user.email === 'liyamu.owner@gmail.com') {
      return res.status(403).json({ message: 'Owner email cannot be changed' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    req.user.email = email;
  }

  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (bio !== undefined) req.user.bio = bio;
  
  // Handle file upload for profile picture
  if (req.file) {
    req.user.profilePicture = `/uploads/${req.file.filename}`;
  }
  
  if (theme) req.user.settings.theme = theme;
  
  if (socialLinks) {
    req.user.socialLinks = { ...req.user.socialLinks, ...socialLinks };
  }

  await req.user.save();
  res.json(req.user);
};

export const getAuthors = async (req, res) => {
  const authors = await User.find({ 
    role: { $in: ['author', 'verified_author', 'pro_writer'] }, 
    isBanned: false 
  }).select('-password');
  const books = await Book.aggregate([{ $group: { _id: '$author', count: { $sum: 1 } } }]);
  const map = new Map(books.map((b) => [String(b._id), b.count]));
  res.json(
    authors.map((a) => ({
      ...a.toObject(),
      bookCount: map.get(String(a._id)) || 0,
    }))
  );
};

export const toggleWishlist = async (req, res) => {
  const { bookId } = req.params;
  
  if (!req.user.wishlist) req.user.wishlist = [];
  
  const hasBook = req.user.wishlist.some((id) => String(id) === String(bookId));
  req.user.wishlist = hasBook
    ? req.user.wishlist.filter((id) => String(id) !== String(bookId))
    : [...req.user.wishlist, bookId];
  await req.user.save();
  res.json({ wishlist: req.user.wishlist });
};

export const toggleFollow = async (req, res) => {
  try {
    const { authorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(authorId)) return res.status(400).json({ message: 'Invalid Author ID' });

    const author = await User.findById(authorId);
    if (!author) return res.status(404).json({ message: 'Author not found' });

    if (!req.user.following) req.user.following = [];
    const isFollowing = req.user.following.some(id => String(id) === String(authorId));

    if (isFollowing) {
      req.user.following = req.user.following.filter(id => String(id) !== String(authorId));
      author.followersCount = Math.max(0, (author.followersCount || 0) - 1);
    } else {
      req.user.following.push(new mongoose.Types.ObjectId(authorId));
      author.followersCount = (author.followersCount || 0) + 1;
      await Notification.create({
        user: authorId,
        title: 'New Follower!',
        message: `${req.user.name} started following you.`,
        type: 'user'
      });
    }

    await req.user.save();
    await author.save();
    res.json({ following: req.user.following, followersCount: author.followersCount });
  } catch (err) {
    console.error('Toggle Follow Error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

export const getFollowedAuthors = async (req, res) => {
  const user = await User.findById(req.user._id).populate('following', 'name profilePicture role followersCount bio');
  res.json(user.following);
};

export const updateReadingProgress = async (req, res) => {
  try {
    const { bookId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).json({ message: 'Invalid Book ID' });

    const bId = new mongoose.Types.ObjectId(bookId);
    req.user.lastReadBook = bId;
    
    if (!req.user.readingHistory) req.user.readingHistory = [];
    if (!req.user.readingHistory.some(id => String(id) === String(bookId))) {
      req.user.readingHistory.push(bId);
    }
    
    await req.user.save();
    res.json({ lastReadBook: req.user.lastReadBook });
  } catch (err) {
    console.error('Update Reading Progress Error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

export const toggleBookmark = async (req, res) => {
  const { workId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(workId)) return res.status(400).json({ message: 'Invalid Work ID' });

  if (!req.user.bookmarkedWorks) req.user.bookmarkedWorks = [];
  
  const hasBookmarked = req.user.bookmarkedWorks.some((id) => String(id) === String(workId));
  req.user.bookmarkedWorks = hasBookmarked
    ? req.user.bookmarkedWorks.filter((id) => String(id) !== String(workId))
    : [...req.user.bookmarkedWorks, workId];
    
  await req.user.save();
  res.json({ bookmarkedWorks: req.user.bookmarkedWorks });
};

export const getBookmarkedWorks = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'bookmarkedWorks',
    populate: { path: 'author', select: 'name profilePicture' }
  });
  res.json(user.bookmarkedWorks || []);
};

export const deleteMyAccount = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new Error('User not found');

  // Protect Owner Account
  if (user.email === 'liyamu.owner@gmail.com') {
    return res.status(403).json({ message: 'Owner account cannot be deleted' });
  }

  // Hard-delete? No, soft-delete per implementation plan for audit/restoration potential.
  user.isDeleted = true;
  user.deletedAt = new Date();
  
  const originalName = user.name;
  user.name = `[DELETED USER ${user._id.toString().slice(-4)}]`;
  user.email = `deleted_${Date.now()}_${user._id}@liyamu.com`;
  user.password = 'N/A'; // De-authenticate
  
  await user.save({ validateBeforeSave: false });

  // Create a notification for audit/final record
  await Notification.create({
    user: user._id,
    title: 'Account Deleted',
    message: `Hello ${originalName}, your account has been successfully deleted as per your request. If this was a mistake, please contact support within 30 days.`,
    type: 'user'
  });

  res.json({ success: true, message: 'Account deleted successfully' });
};

export const getAuthorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid ID' });

    const author = await User.findById(id).select('-password').lean();
    if (!author) return res.status(404).json({ message: 'Author not found' });

    // Fetch author's books
    const books = await Book.find({ author: id, status: 'published' }).sort({ createdAt: -1 });
    
    // Fetch author's creative works (In a real app, you'd import CreativeWork model)
    // For now, we'll try to find if a CreativeWork model exists or just return empty
    // Let's check for the CreativeWork model name first.
    let creativeWorks = [];
    try {
      const CreativeWork = mongoose.model('CreativeWork');
      creativeWorks = await CreativeWork.find({ author: id }).sort({ createdAt: -1 }).limit(10);
    } catch (e) {
      console.log("CreativeWork model not yet initialized in this process");
    }

    res.json({
      ...author,
      books,
      creativeWorks
    });
  } catch (err) {
    console.error('Get Author Profile Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'New passwords do not match' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.socialProvider !== 'local') {
    return res.status(400).json({ message: 'Social accounts cannot change password here' });
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ message: 'Incorrect current password' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password updated successfully' });
};
