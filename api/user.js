import { client, ensureTables } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await ensureTables();

  const action = req.query.action || req.body?.action || (req.url.includes('register') ? 'register' : req.url.includes('login') ? 'login' : req.url.includes('reset') ? 'reset' : 'profile');

  // Register
  if (action === 'register' && req.method === 'POST') {
    try {
      const { name, email, password, phone, location } = req.body || {};
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password required' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const check = await client.execute({ sql: 'SELECT * FROM users WHERE LOWER(email) = ?', args: [normalizedEmail] });
      if (check.rows.length > 0) {
        return res.status(400).json({ error: 'Account already exists. Please log in.' });
      }

      const id = `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await client.execute({
        sql: `INSERT INTO users (id, name, email, password, phone, location, avatar, bio, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          name.trim(),
          normalizedEmail,
          password,
          phone?.trim() || '+91 98765 43210',
          location?.trim() || 'Anna Nagar, Chennai',
          `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
          'Rently member ready to rent and share gear.',
          new Date().toISOString(),
        ],
      });

      return res.status(201).json({
        id,
        _id: id,
        name: name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || '+91 98765 43210',
        location: location?.trim() || 'Anna Nagar, Chennai',
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
        bio: 'Rently member ready to rent and share gear.',
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Login
  if (action === 'login' && req.method === 'POST') {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const check = await client.execute({ sql: 'SELECT * FROM users WHERE LOWER(email) = ?', args: [normalizedEmail] });
      if (check.rows.length === 0) {
        return res.status(401).json({ error: 'No account found with this email. Please sign up.' });
      }

      const user = check.rows[0];
      if (user.password !== password) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }

      const { password: _, ...safeUser } = user;
      return res.status(200).json({ ...safeUser, _id: user.id });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Reset password
  if (action === 'reset' && req.method === 'POST') {
    try {
      const { email, newPassword } = req.body || {};
      const normalizedEmail = (email || '').toLowerCase().trim();
      const check = await client.execute({ sql: 'SELECT * FROM users WHERE LOWER(email) = ?', args: [normalizedEmail] });
      if (check.rows.length === 0) {
        return res.status(404).json({ error: 'No account found with this email.' });
      }

      await client.execute({ sql: 'UPDATE users SET password = ? WHERE LOWER(email) = ?', args: [newPassword, normalizedEmail] });
      return res.status(200).json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Profile GET
  if (req.method === 'GET') {
    try {
      const { email, id } = req.query;
      let resRow;
      if (email) {
        resRow = await client.execute({ sql: 'SELECT * FROM users WHERE LOWER(email) = ?', args: [email.toLowerCase().trim()] });
      } else if (id) {
        resRow = await client.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [id] });
      } else {
        resRow = await client.execute({ sql: 'SELECT * FROM users LIMIT 1' });
      }

      if (resRow.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
      const { password, ...safeUser } = resRow.rows[0];
      return res.status(200).json({ ...safeUser, _id: safeUser.id });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
