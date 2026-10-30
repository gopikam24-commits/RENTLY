import { client, ensureTables } from '../../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  await ensureTables();
  const { id } = req.query || {};
  const { sender, senderEmail, text, photos } = req.body || {};

  if (!id) return res.status(400).json({ error: 'Rental ID required' });
  if (!text && (!photos || !photos.length)) {
    return res.status(400).json({ error: 'Message text or photo is required.' });
  }

  try {
    const resRow = await client.execute({ sql: 'SELECT * FROM rentals WHERE id = ?', args: [id] });
    if (resRow.rows.length === 0) return res.status(404).json({ error: 'Rental not found' });
    const rental = resRow.rows[0];

    const newMsg = {
      sender: sender || 'User',
      senderEmail: senderEmail || '',
      text: text || '',
      photos: Array.isArray(photos) ? photos : [],
      isProof: false,
      createdAt: new Date().toISOString(),
    };

    let messages = [];
    try { messages = JSON.parse(rental.messages || '[]'); } catch {}
    messages.push(newMsg);

    await client.execute({
      sql: `UPDATE rentals SET messages = ? WHERE id = ?`,
      args: [JSON.stringify(messages), id],
    });

    const updatedRow = await client.execute({ sql: 'SELECT * FROM rentals WHERE id = ?', args: [id] });
    return res.status(200).json({
      success: true,
      message: newMsg,
      rental: { ...updatedRow.rows[0], _id: id, id, messages },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
