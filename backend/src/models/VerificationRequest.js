import mongoose from 'mongoose';

const verificationRequestSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    idNumber: { type: String, required: true }, // Added for author application
    contactNumber: { type: String, required: true },
    documentUrl: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    rejectionReason: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('VerificationRequest', verificationRequestSchema);
