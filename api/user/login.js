import { client, ensureTables } from '../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await ensureTables();
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const check = await client.execute({
      sql: 'SELECT * FROM users WHERE LOWER(email) = ?',
      args: [normalizedEmail],
    });

    if (check.rows.length === 0) {
      return res.status(401).json({ error: 'No account found with this email. Please check your email or sign up.' });
    }

    const user = check.rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const { password: _, ...safeUser } = user;
    return res.status(200).json({
      ...safeUser,
      _id: user.id,
      id: user.id,
    });
  } catch (err) {
    console.error('[API Login Error]', err);
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
}
