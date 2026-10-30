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
  const { otp, photos } = req.body || {};

  if (!id) return res.status(400).json({ error: 'Rental ID required' });
  if (!otp) return res.status(400).json({ error: 'Please enter the 6-digit Pickup OTP.' });

  try {
    const resRow = await client.execute({ sql: 'SELECT * FROM rentals WHERE id = ?', args: [id] });
    if (resRow.rows.length === 0) return res.status(404).json({ error: 'Rental not found' });
    const rental = resRow.rows[0];

    if (String(rental.pickupOtp).trim() !== String(otp).trim()) {
      return res.status(400).json({ error: 'Incorrect Pickup OTP. Please check the OTP from the customer.' });
    }

    const finalPhotos = Array.isArray(photos) && photos.length ? photos : [];
    let messages = [];
    try { messages = JSON.parse(rental.messages || '[]'); } catch {}
    messages.push({
      sender: `${rental.sellerName || 'Owner'} (Owner)`,
      senderEmail: rental.sellerEmail,
      text: '📸 Initial Pickup Condition Proof recorded. Safe handover complete.',
      photos: finalPhotos,
      isProof: true,
      createdAt: new Date().toISOString(),
    });

    const now = new Date().toISOString();
    await client.execute({
      sql: `UPDATE rentals SET pickupVerified = 1, pickupPhotos = ?, pickupTimestamp = ?, status = 'Active', messages = ? WHERE id = ?`,
      args: [JSON.stringify(finalPhotos), now, JSON.stringify(messages), id],
    });

    const updatedRow = await client.execute({ sql: 'SELECT * FROM rentals WHERE id = ?', args: [id] });
    return res.status(200).json({
      success: true,
      message: '✓ Pickup Confirmed! Handover verified.',
      rental: { ...updatedRow.rows[0], _id: id, id, messages, pickupPhotos: finalPhotos, pickupVerified: true },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
