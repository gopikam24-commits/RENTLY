import { client, ensureTables } from '../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await ensureTables();
  const { id } = req.query || {};

  if (!id) {
    return res.status(400).json({ error: 'Product ID required' });
  }

  if (req.method === 'GET') {
    try {
      const resRow = await client.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
      if (resRow.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
      const p = resRow.rows[0];
      let images = [];
      try {
        images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [];
      } catch {}
      return res.status(200).json({ ...p, _id: p.id, id: p.id, images });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await client.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });
      return res.status(200).json({ success: true, message: 'Listing deleted.' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
