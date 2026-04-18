import CreativeWork from '../models/CreativeWork.js';
import { ApiError } from '../utils/apiError.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { notifyAdmins } from '../utils/notificationHelper.js';
import ispurify from 'isomorphic-dompurify';

const DOMPurify = ispurify;

export const createWork = async (req, res) => {
  const { title, content, category, language = 'English', tags = [] } = req.body;
  if (!title || !content || !category) throw new ApiError(400, 'Missing required fields');

  const work = await CreativeWork.create({
    title,
    content: DOMPurify.sanitize(content),
    category,
    language,
    tags,
    author: req.user._id,
  });

  // Notify Admins for moderation
  await notifyAdmins({
    title: 'Creative Corner Moderation',
    message: `New creative work "${title}" posted by ${req.user.name}.`,
    type: 'creative',
    metadata: {
      action_type: 'creative_submission',
      title: title,
      authorName: req.user.name,
      category: category
    }
  });

  res.status(201).json(work);
};

export const getWorks = async (req, res) => {
  const { search = '', category, language } = req.query;
  
  let validAuthorIds = [];
  if (search) {
    const matchingUsers = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');
    validAuthorIds = matchingUsers.map(u => u._id);
  }

  const query = {};
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
      { author: { $in: validAuthorIds } }
    ];
  }
  
  if (category && category !== 'All') query.category = category;
  if (language && language !== 'All') query.language = language;
  
  // Only show approved and non-deleted works in public feed
  query.status = 'approved';
  query.isDeleted = { $ne: true };

  const works = await CreativeWork.find(query)
    .populate('author', 'name profilePicture badges')
    .sort({ createdAt: -1 });

  res.json(works);
};

export const getWorkById = async (req, res) => {
  const work = await CreativeWork.findById(req.params.id)
    .populate('author', 'name profilePicture badges followersCount')
    .populate('comments.user', 'name profilePicture');
    
  if (!work) throw new ApiError(404, 'Work not found');

  // If not approved, only author or admin can see it
  if (work.status !== 'approved' && (!req.user || (String(req.user._id) !== String(work.author._id) && req.user.role !== 'admin'))) {
    throw new ApiError(403, 'This work is pending moderation.');
  }

  work.viewCount += 1;
  await work.save();

  res.json(work);
};

export const likeWork = async (req, res) => {
  const work = await CreativeWork.findById(req.params.id);
  if (!work) throw new ApiError(404, 'Work not found');

  const index = work.likes.indexOf(req.user._id);
  let isLiked = false;
  if (index === -1) {
    work.likes.push(req.user._id);
    work.likesCount += 1;
    isLiked = true;

    if (String(work.author) !== String(req.user._id)) {
      await Notification.create({
        user: work.author,
        title: 'New Like on Creative Corner',
        message: `${req.user.name} liked your creative work "${work.title}".`,
        type: 'creative',
      });
    }
  } else {
    work.likes.splice(index, 1);
    work.likesCount -= 1;
  }

  await work.save();
  res.json({ likesCount: work.likesCount, isLiked });
};

export const addComment = async (req, res) => {
  const { text } = req.body;
  const work = await CreativeWork.findById(req.params.id);
  if (!work) throw new ApiError(404, 'Work not found');

  work.comments.push({ user: req.user._id, text: DOMPurify.sanitize(text) });
  await work.save();

  if (String(work.author) !== String(req.user._id)) {
    await Notification.create({
      user: work.author,
      title: 'New Comment on Creative Corner',
      message: `${req.user.name} commented on your work "${work.title}".`,
      type: 'creative',
    });
  }

  const populatedWork = await CreativeWork.findById(work._id).populate('comments.user', 'name profilePicture');
  res.json(populatedWork.comments);
};

export const deleteMyWork = async (req, res) => {
  const work = await CreativeWork.findById(req.params.id);
  if (!work) throw new ApiError(404, 'Work not found');

  if (String(work.author) !== String(req.user._id)) {
    throw new ApiError(403, 'Unauthorized');
  }

  work.isDeleted = true;
  work.deletedAt = new Date();
  await work.save();

  await Notification.create({
    user: req.user._id,
    title: 'Work Deleted',
    message: `Your work "${work.title}" has been deleted. You can restore it from your profile.`,
    type: 'creative',
  });

  res.json({ success: true, message: 'Work moved to trash' });
};

export const getUserDeletedWorks = async (req, res) => {
  const works = await CreativeWork.find({ 
    author: req.user._id, 
    isDeleted: true 
  }).sort({ deletedAt: -1 });
  
  res.json(works);
};

export const restoreWork = async (req, res) => {
  const work = await CreativeWork.findById(req.params.id);
  if (!work) throw new ApiError(404, 'Work not found');

  if (String(work.author) !== String(req.user._id)) {
    throw new ApiError(403, 'Unauthorized');
  }

  work.isDeleted = false;
  work.deletedAt = null;
  await work.save();

  await Notification.create({
    user: req.user._id,
    title: 'Work Restored',
    message: `Your work "${work.title}" has been restored.`,
    type: 'creative',
  });

  res.json({ success: true, message: 'Work restored successfully' });
};
