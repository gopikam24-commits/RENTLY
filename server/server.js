import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb, isCloudSqlite } from './config/sqliteDb.js';
import { getProductRouter } from './routes/productRoutes.js';
import { getRentalRouter } from './routes/rentalRoutes.js';
import { getUserRouter } from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize SQLite Database (Turso Cloud / Local SQLite)
await initDb();

// API Routes
app.use('/api/products', getProductRouter());
app.use('/api/rentals', getRentalRouter());
app.use('/api/user', getUserRouter());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: isCloudSqlite ? 'Turso Cloud SQLite' : 'Local SQLite',
    cloud: isCloudSqlite,
  });
});

app.listen(PORT, () => {
  console.log(`[RentalHub Backend] Express Server listening on http://localhost:${PORT}`);
});
