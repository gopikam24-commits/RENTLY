import { client, ensureTables } from '../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await ensureTables();

  // GET /api/user/profile
  if (req.method === 'GET') {
    try {
      const { email, id } = req.query || {};
      let resRow;
      if (email) {
        resRow = await client.execute({ sql: 'SELECT * FROM users WHERE LOWER(email) = ?', args: [email.toLowerCase().trim()] });
      } else if (id) {
        resRow = await client.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [id] });
      } else {
        resRow = await client.execute({ sql: 'SELECT * FROM users LIMIT 1' });
      }

      if (resRow.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      const { password, ...safeUser } = resRow.rows[0];
      return res.status(200).json({ ...safeUser, _id: safeUser.id });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // PUT /api/user/profile
  if (req.method === 'PUT') {
    try {
      const { id, _id, name, phone, location, bio } = req.body || {};
      const targetId = id || _id;
      if (!targetId) return res.status(400).json({ error: 'User ID required' });

      const fields = [];
      const args = [];
      if (name) { fields.push('name = ?'); args.push(name.trim()); }
      if (phone) { fields.push('phone = ?'); args.push(phone.trim()); }
      if (location) { fields.push('location = ?'); args.push(location.trim()); }
      if (bio) { fields.push('bio = ?'); args.push(bio.trim()); }

      if (fields.length > 0) {
        args.push(targetId);
        await client.execute({ sql: `UPDATE users SET ${fields.join(', ')} WHERE id = ?`, args });
      }

      const resRow = await client.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [targetId] });
      if (resRow.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      const { password, ...safeUser } = resRow.rows[0];
      return res.status(200).json({ ...safeUser, _id: safeUser.id });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
