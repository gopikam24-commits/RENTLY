import mongoose from 'mongoose';
import { localDb } from './localDb.js';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  
  // If no MONGO_URI is explicitly set or if local connect fails, gracefully use localDb
  try {
    const conn = await mongoose.connect(mongoUri || 'mongodb://127.0.0.1:27017/rentalhub', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.log(`[Database] Local/Cloud MongoDB not active (${error.message}).`);
    console.log(`[Database] Utilizing High-Performance Persistent JSON Database at server/data/`);
    // Ensure all collections are seeded and ready
    localDb.read('users');
    localDb.read('products');
    localDb.read('rentals');
    return false;
  }
};
