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
  const { otp } = req.body || {};

  if (!id) return res.status(400).json({ error: 'Rental ID required' });
  if (!otp) return res.status(400).json({ error: 'Please enter the 6-digit Return OTP.' });

  try {
    const resRow = await client.execute({ sql: 'SELECT * FROM rentals WHERE id = ?', args: [id] });
    if (resRow.rows.length === 0) return res.status(404).json({ error: 'Rental not found' });
    const rental = resRow.rows[0];

    if (String(rental.returnOtp).trim() !== String(otp).trim()) {
      return res.status(400).json({ error: 'Incorrect Return OTP.' });
    }

    let messages = [];
    try { messages = JSON.parse(rental.messages || '[]'); } catch {}
    messages.push({
      sender: 'System / Rently Platform',
      senderEmail: 'system@rently.com',
      text: `✓ Return Confirmed & Completed. "${rental.productTitle}" returned. Refundable advance settled.`,
      isProof: false,
      createdAt: new Date().toISOString(),
    });

    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE rentals SET returnVerified = 1, depositRefunded = 1, returnTimestamp = ?, status = 'Completed', messages = ? WHERE id = ?`,
      args: [now, JSON.stringify(messages), id],
    });

    const updatedRow = await client.execute({ sql: 'SELECT * FROM rentals WHERE id = ?', args: [id] });
    return res.status(200).json({
      success: true,
      message: '✓ Return Confirmed! Rental successfully completed.',
      rental: { ...updatedRow.rows[0], _id: id, id, messages, returnVerified: true, depositRefunded: true },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
