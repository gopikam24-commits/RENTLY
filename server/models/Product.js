import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    priceUnit: { type: String, default: 'day' },
    location: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    tag: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    sellerName: { type: String, default: 'Lakshmi Preethiga' },
    sellerPhone: { type: String, default: '+91 8754104594' },
    sellerEmail: { type: String, default: 'lachulakshmi4707@gmail.com' },
    sellerAddress: { type: String, default: 'Perur, Coimbatore' },
    pickupInstructions: { type: String, default: 'Contact seller directly to arrange pickup time.' },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 1 },
    advanceDeposit: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
