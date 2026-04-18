import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    documentType: { type: String, enum: ['text', 'pdf'], required: true },
    content: String,
    coverUrl: String,
    pdfUrl: String,
    isFree: { type: Boolean, default: true },
    price: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: String,
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    sellCount: { type: Number, default: 0 },
    isHidden: { type: Boolean, default: false },
    protectedMode: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Book', bookSchema);
