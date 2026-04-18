import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 200 },
    bankDetails: {
      accountName: { type: String, required: true },
      bankName: { type: String, required: true },
      branchName: { type: String, required: true },
      accountNumber: { type: String, required: true },
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'rejected'], 
      default: 'pending' 
    },
    rejectionReason: { type: String, default: '' },
    payoutSlip: { type: String, default: '' }, // URL to confirm image
    feeAmount: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Withdrawal', withdrawalSchema);
