import { client, ensureTables } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  await ensureTables();
  const isCloud = Boolean(process.env.TURSO_DATABASE_URL || process.env.SQLITE_URL);
  res.status(200).json({
    status: 'OK',
    database: isCloud ? 'Turso Cloud SQLite' : 'Local SQLite',
    cloud: isCloud,
    platform: 'Vercel Serverless',
  });
}
