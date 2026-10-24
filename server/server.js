import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDB } from './seed.js';
import { getProductRouter } from './routes/productRoutes.js';
import { getRentalRouter } from './routes/rentalRoutes.js';
import { getUserRouter } from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let mongoConnected = false;

// Connect Database & Seed
(async () => {
  mongoConnected = await connectDB();
  if (mongoConnected) {
    await seedDB();
  }
})();

const isMongoConnected = () => mongoConnected;

// API Routes
app.use('/api/products', getProductRouter(isMongoConnected));
app.use('/api/rentals', getRentalRouter(isMongoConnected));
app.use('/api/user', getUserRouter(isMongoConnected));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', mongoConnected });
});

app.listen(PORT, () => {
  console.log(`[RentalHub Backend] Express Server listening on http://localhost:${PORT}`);
});
