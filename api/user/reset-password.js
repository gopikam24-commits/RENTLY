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
    const { email, newPassword } = req.body || {};

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const check = await client.execute({
      sql: 'SELECT * FROM users WHERE LOWER(email) = ?',
      args: [normalizedEmail],
    });

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email.' });
    }

    await client.execute({
      sql: 'UPDATE users SET password = ? WHERE LOWER(email) = ?',
      args: [newPassword, normalizedEmail],
    });

    return res.status(200).json({ success: true, message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Password reset failed.' });
  }
}
