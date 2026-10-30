import { client, ensureTables } from './lib/db.js';

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

  await ensureTables();

  // GET /api/rentals
  if (req.method === 'GET') {
    try {
      const { userEmail, renterEmail, sellerEmail } = req.query || {};
      let sql = 'SELECT * FROM rentals WHERE 1=1';
      const args = [];

      if (userEmail) {
        const u = userEmail.toLowerCase().trim();
        sql += ' AND (LOWER(renterEmail) = ? OR LOWER(sellerEmail) = ?)';
        args.push(u, u);
      } else if (renterEmail) {
        sql += ' AND LOWER(renterEmail) = ?';
        args.push(renterEmail.toLowerCase().trim());
      } else if (sellerEmail) {
        sql += ' AND LOWER(sellerEmail) = ?';
        args.push(sellerEmail.toLowerCase().trim());
      }
      sql += ' ORDER BY createdAt DESC';

      const result = await client.execute({ sql, args });
      const rentals = result.rows.map((row) => {
        let pickupPhotos = [];
        let returnPhotos = [];
        let messages = [];
        try { pickupPhotos = typeof row.pickupPhotos === 'string' ? JSON.parse(row.pickupPhotos) : row.pickupPhotos || []; } catch {}
        try { returnPhotos = typeof row.returnPhotos === 'string' ? JSON.parse(row.returnPhotos) : row.returnPhotos || []; } catch {}
        try { messages = typeof row.messages === 'string' ? JSON.parse(row.messages) : row.messages || []; } catch {}

        return {
          ...row,
          _id: row.id,
          id: row.id,
          pickupVerified: Boolean(row.pickupVerified),
          returnVerified: Boolean(row.returnVerified),
          depositRefunded: Boolean(row.depositRefunded),
          pickupPhotos,
          returnPhotos,
          messages,
        };
      });

      return res.status(200).json(rentals);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST /api/rentals
  if (req.method === 'POST') {
    try {
      const {
        productId,
        productTitle,
        productImage,
        renterId,
        renterName,
        renterEmail,
        renterPhone,
        sellerId,
        sellerName,
        sellerEmail,
        sellerPhone,
        sellerAddress,
        startDate,
        days,
        totalPrice,
        advanceDeposit,
      } = req.body || {};

      if (!productId || !productTitle || !startDate || !days || !totalPrice) {
        return res.status(400).json({ error: 'Please provide all booking details.' });
      }

      const id = `r_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const pickupOtp = String(Math.floor(100000 + Math.random() * 900000));
      const returnOtp = String(Math.floor(100000 + Math.random() * 900000));

      const initialMessage = [
        {
          sender: 'System / Rently Platform',
          senderEmail: 'system@rently.com',
          text: `Booking initiated for "${productTitle}". Secret Pickup OTP sent to customer. Private chat established.`,
          isProof: false,
          createdAt: new Date().toISOString(),
        },
      ];

      await client.execute({
        sql: `INSERT INTO rentals (id, productId, productTitle, productImage, renterId, renterName, renterEmail, renterPhone, sellerId, sellerName, sellerEmail, sellerPhone, sellerAddress, startDate, days, totalPrice, advanceDeposit, depositRefunded, pickupOtp, pickupVerified, pickupPhotos, returnOtp, returnVerified, returnPhotos, status, messages, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          productId,
          productTitle,
          productImage || '',
          renterId || '',
          renterName || 'Customer',
          renterEmail?.toLowerCase().trim() || '',
          renterPhone || '',
          sellerId || '',
          sellerName || 'Owner',
          sellerEmail?.toLowerCase().trim() || '',
          sellerPhone || '',
          sellerAddress || '',
          startDate,
          Number(days) || 1,
          Number(totalPrice) || 0,
          Number(advanceDeposit) || 0,
          0,
          pickupOtp,
          0,
          JSON.stringify([]),
          returnOtp,
          0,
          JSON.stringify([]),
          'Pickup Pending',
          JSON.stringify(initialMessage),
          new Date().toISOString(),
        ],
      });

      return res.status(201).json({
        id,
        _id: id,
        productId,
        productTitle,
        productImage: productImage || '',
        renterId,
        renterName,
        renterEmail,
        pickupOtp,
        returnOtp,
        pickupVerified: false,
        returnVerified: false,
        depositRefunded: false,
        pickupPhotos: [],
        returnPhotos: [],
        messages: initialMessage,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
