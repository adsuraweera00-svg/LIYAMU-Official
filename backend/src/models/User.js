import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Invalid email'],
    },
    password: { type: String, required: true, minlength: 6 },
    role: { 
      type: String, 
      enum: ['reader', 'beginner_reader', 'pro_reader', 'author', 'verified_author', 'pro_writer', 'admin'], 
      default: 'beginner_reader' 
    },
    socialProvider: { type: String, enum: ['local', 'google', 'facebook'], default: 'local' },
    badges: {
      author: { type: Boolean, default: false },
      verifiedAuthor: { type: Boolean, default: false },
      proWriter: { type: Boolean, default: false },
      pro: { type: Boolean, default: false },
      owner: { type: Boolean, default: false },
      proReader: { type: Boolean, default: false },
    },
    isPro: { type: Boolean, default: false },
    proExpiryDate: Date,
    proType: { type: String, enum: ['1m', '3m', '1y', 'none'], default: 'none' },
    isBanned: { type: Boolean, default: false },
    profilePicture: String,
    phone: String,
    bio: String,
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: [] }],
    bookmarkedWorks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CreativeWork', default: [] }],
    purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: [] }],
    readingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: [] }],
    lastReadBook: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: null },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    followersCount: { type: Number, default: 0 },
    settings: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    },
    creditBalance: { type: Number, default: 0 },
    earningsBalance: { type: Number, default: 0 },
    socialLinks: {
      facebook: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
      telegram: { type: String, default: '' },
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
