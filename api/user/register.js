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
    const { name, email, password, phone, location } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const check = await client.execute({
      sql: 'SELECT * FROM users WHERE LOWER(email) = ?',
      args: [normalizedEmail],
    });

    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const id = `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const userPhone = phone?.trim() || '+91 98765 43210';
    const userLoc = location?.trim() || 'Anna Nagar, Chennai';
    const userAvatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`;
    const userBio = 'Rently member ready to rent and share gear.';

    await client.execute({
      sql: `INSERT INTO users (id, name, email, password, phone, location, avatar, bio, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, name.trim(), normalizedEmail, password, userPhone, userLoc, userAvatar, userBio, now],
    });

    return res.status(201).json({
      id,
      _id: id,
      name: name.trim(),
      email: normalizedEmail,
      phone: userPhone,
      location: userLoc,
      avatar: userAvatar,
      bio: userBio,
      createdAt: now,
    });
  } catch (err) {
    console.error('[API Register Error]', err);
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
}
