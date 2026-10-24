import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '+91 98765 43210' },
    location: { type: String, default: 'Anna Nagar, Chennai' },
    avatar: { type: String, default: 'https://picsum.photos/seed/useravatar/200/200' },
    bio: { type: String, default: 'Avid photographer & tech enthusiast. Love sharing gear and borrowing outdoor equipment!' },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);

