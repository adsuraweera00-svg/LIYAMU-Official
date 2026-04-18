import mongoose from 'mongoose';

const creditRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: String, required: true },
    amount: { type: Number, required: true },
    price: { type: Number, required: true },
    slipUrl: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    adminNote: String,
    rejectionReason: String,
  },
  { timestamps: true }
);

export default mongoose.model('CreditRequest', creditRequestSchema);
