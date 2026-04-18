import mongoose from 'mongoose';

const creditTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['purchase', 'spend', 'admin_add', 'admin_remove', 'refund'], 
      required: true 
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    metadata: {
      packageId: String,
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
      adminNote: String
    }
  },
  { timestamps: true }
);

export default mongoose.model('CreditTransaction', creditTransactionSchema);
