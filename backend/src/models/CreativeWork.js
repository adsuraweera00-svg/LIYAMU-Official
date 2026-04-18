import mongoose from 'mongoose';

const creativeWorkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    language: { type: String, default: 'English' },
    tags: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    viewCount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

export default mongoose.model('CreativeWork', creativeWorkSchema);
