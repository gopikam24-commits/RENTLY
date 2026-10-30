import { client, ensureTables } from './lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await ensureTables();
  } catch (err) {
    console.error('[Turso Init Error]', err);
  }

  // GET /api/products
  if (req.method === 'GET') {
    try {
      const { search, radius, sort, tag, sellerEmail, sellerId } = req.query || {};
      let sql = 'SELECT * FROM products WHERE 1=1';
      const args = [];

      if (search) {
        sql += ' AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ?)';
        args.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
      }
      if (radius) {
        sql += ' AND distanceKm <= ?';
        args.push(Number(radius));
      }
      if (tag) {
        sql += ' AND tag = ?';
        args.push(tag);
      }
      if (sellerEmail) {
        sql += ' AND LOWER(sellerEmail) = ?';
        args.push(sellerEmail.toLowerCase().trim());
      }
      if (sellerId) {
        sql += ' AND sellerId = ?';
        args.push(sellerId);
      }

      if (sort === 'low') {
        sql += ' ORDER BY price ASC';
      } else if (sort === 'high') {
        sql += ' ORDER BY price DESC';
      } else {
        sql += ' ORDER BY createdAt DESC';
      }

      const result = await client.execute({ sql, args });
      const products = result.rows.map((row) => {
        let images = [];
        try {
          images = typeof row.images === 'string' ? JSON.parse(row.images) : row.images || [];
        } catch {
          images = [];
        }
        return {
          ...row,
          _id: row.id,
          id: row.id,
          images: Array.isArray(images) ? images : [],
        };
      });

      return res.status(200).json(products);
    } catch (err) {
      console.error('[API Products GET Error]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // POST /api/products
  if (req.method === 'POST') {
    try {
      const {
        title,
        price,
        priceUnit,
        location,
        distanceKm,
        tag,
        description,
        images,
        sellerId,
        sellerName,
        sellerPhone,
        sellerEmail,
        sellerAddress,
        pickupInstructions,
        advanceDeposit,
      } = req.body || {};

      if (!title || !price || !location || !tag || !description) {
        return res.status(400).json({ error: 'Please provide all required product details.' });
      }

      const id = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const imagesJson = JSON.stringify(
        Array.isArray(images) && images.length
          ? images
          : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80']
      );
      const now = new Date().toISOString();

      await client.execute({
        sql: `INSERT INTO products (id, title, price, priceUnit, advanceDeposit, location, distanceKm, tag, description, images, sellerId, sellerName, sellerPhone, sellerEmail, sellerAddress, pickupInstructions, rating, reviewCount, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          title.trim(),
          Number(price),
          priceUnit || 'day',
          Number(advanceDeposit) || 0,
          location.trim(),
          Number(distanceKm) || 4,
          tag.trim(),
          description.trim(),
          imagesJson,
          sellerId || '',
          sellerName?.trim() || 'Owner',
          sellerPhone?.trim() || '',
          sellerEmail?.toLowerCase().trim() || '',
          sellerAddress?.trim() || '',
          pickupInstructions?.trim() || 'Contact owner directly for handover.',
          5.0,
          1,
          now,
        ],
      });

      const resRow = await client.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
      const created = resRow.rows[0];
      let resImages = [];
      try {
        resImages = JSON.parse(created.images);
      } catch {}

      return res.status(201).json({
        ...created,
        _id: created.id,
        id: created.id,
        images: resImages,
      });
    } catch (err) {
      console.error('[API Products POST Error]', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE /api/products
  if (req.method === 'DELETE') {
    try {
      const id = req.query?.id || req.body?.id;
      if (!id) return res.status(400).json({ error: 'Product ID required' });
      await client.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });
      return res.status(200).json({ success: true, message: 'Listing deleted.' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
