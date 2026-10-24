import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  senderEmail: { type: String },
  text: { type: String, default: '' },
  photos: [{ type: String }],
  isProof: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const rentalSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productTitle: { type: String, required: true },
    renterName: { type: String, default: 'Alex Morgan' },
    renterEmail: { type: String, default: 'alex.morgan@example.com' },
    renterPhone: { type: String, default: '+91 91234 56789' },
    sellerName: { type: String, default: 'Lakshmi Preethiga' },
    sellerEmail: { type: String, default: 'lachulakshmi4707@gmail.com' },
    sellerPhone: { type: String, default: '+91 8754104594' },
    sellerAddress: { type: String, default: 'Perur, Coimbatore' },
    startDate: { type: String, required: true },
    days: { type: Number, required: true, default: 1 },
    totalPrice: { type: Number, required: true },
    pickupOtp: { type: String, required: true },
    pickupVerified: { type: Boolean, default: false },
    pickupPhotos: [{ type: String }],
    pickupTimestamp: { type: Date },
    returnOtp: { type: String, required: true },
    returnVerified: { type: Boolean, default: false },
    returnPhotos: [{ type: String }],
    returnTimestamp: { type: Date },
    status: { type: String, default: 'Pickup Pending' }, // 'Pickup Pending' | 'Active' | 'Return Pending' | 'Completed'
    advanceDeposit: { type: Number, default: 0 },
    depositRefunded: { type: Boolean, default: false },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export const Rental = mongoose.models.Rental || mongoose.model('Rental', rentalSchema);

