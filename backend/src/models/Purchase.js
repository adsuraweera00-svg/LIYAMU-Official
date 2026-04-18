import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    soldPrice: { type: Number, required: true },
    websiteTax: { type: Number, required: true },
    authorEarnings: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Purchase', purchaseSchema);
