import express from 'express';
import cors from 'cors';
import { initDb, isCloudSqlite } from '../server/config/sqliteDb.js';
import { getProductRouter } from '../server/routes/productRoutes.js';
import { getRentalRouter } from '../server/routes/rentalRoutes.js';
import { getUserRouter } from '../server/routes/userRoutes.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure database tables exist on Turso
let dbReady = false;
async function ensureDb() {
  if (!dbReady) {
    await initDb();
    dbReady = true;
  }
}

app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    console.error('[Database Middleware Error]', err);
    res.status(500).json({ error: 'Database connection failed: ' + err.message });
  }
});

// Mount all API routers
app.use('/api/products', getProductRouter());
app.use('/api/rentals', getRentalRouter());
app.use('/api/user', getUserRouter());

// Direct route aliases for Vercel
app.use('/products', getProductRouter());
app.use('/rentals', getRentalRouter());
app.use('/user', getUserRouter());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: isCloudSqlite ? 'Turso Cloud SQLite' : 'Local SQLite',
    cloud: isCloudSqlite,
    platform: 'Vercel Serverless / Express',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: isCloudSqlite ? 'Turso Cloud SQLite' : 'Local SQLite',
    cloud: isCloudSqlite,
    platform: 'Vercel Serverless / Express',
    timestamp: new Date().toISOString(),
  });
});

export { app };
export default function handler(req, res) {
  return app(req, res);
}
