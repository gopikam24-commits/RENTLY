import express from 'express';
import { Product } from '../models/Product.js';
import { localDb } from '../config/localDb.js';

const router = express.Router();

export function getProductRouter(isMongoConnected) {
  // GET /api/products
  router.get('/', async (req, res) => {
    try {
      const { search, radius, sort, tag, sellerEmail, sellerId } = req.query;

      if (isMongoConnected()) {
        let filter = {};
        if (search) filter.title = { $regex: search, $options: 'i' };
        if (radius) filter.distanceKm = { $lte: Number(radius) };
        if (tag) filter.tag = tag;
        if (sellerEmail) filter.sellerEmail = sellerEmail.toLowerCase().trim();
        if (sellerId) filter.sellerId = sellerId;

        let sortOption = {};
        if (sort === 'low') sortOption.price = 1;
        if (sort === 'high') sortOption.price = -1;

        const products = await Product.find(filter).sort(sortOption);
        return res.json(products);
      } else {
        // Read directly from persistent disk database
        let list = localDb.read('products');

        if (search) {
          const s = search.toLowerCase();
          list = list.filter((p) => p.title?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s));
        }
        if (radius) {
          list = list.filter((p) => (Number(p.distanceKm) || 0) <= Number(radius));
        }
        if (tag) {
          list = list.filter((p) => p.tag === tag);
        }
        if (sellerEmail) {
          list = list.filter((p) => p.sellerEmail?.toLowerCase().trim() === sellerEmail.toLowerCase().trim());
        }
        if (sellerId) {
          list = list.filter((p) => p.sellerId === sellerId);
        }
        if (sort === 'low') {
          list.sort((a, b) => Number(a.price) - Number(b.price));
        }
        if (sort === 'high') {
          list.sort((a, b) => Number(b.price) - Number(a.price));
        }

        return res.json(list);
      }
    } catch (err) {
      console.error('[Products GET Error]', err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/products/:id
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (isMongoConnected()) {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ error: 'Product not found.' });
        return res.json(product);
      } else {
        const product = localDb.findById('products', id);
        if (!product) return res.status(404).json({ error: 'Product not found.' });
        return res.json(product);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/products
  router.post('/', async (req, res) => {
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
      } = req.body;

      if (!title || !price || !location || !tag || !description) {
        return res.status(400).json({ error: 'Please provide all required product details.' });
      }

      const generatedId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const newProduct = {
        id: generatedId,
        _id: generatedId,
        title: title.trim(),
        price: Number(price),
        priceUnit: priceUnit || 'day',
        advanceDeposit: Number(advanceDeposit) || 0,
        location: location.trim(),
        distanceKm: Number(distanceKm) || Math.floor(Math.random() * 12) + 2,
        tag: tag.trim(),
        description: description.trim(),
        images: images && images.length ? images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'],
        sellerId: sellerId || `u_${Date.now()}`,
        sellerName: sellerName?.trim() || 'Rently Member',
        sellerPhone: sellerPhone?.trim() || '+91 98765 43210',
        sellerEmail: sellerEmail?.toLowerCase().trim() || '',
        sellerAddress: sellerAddress?.trim() || location.trim(),
        pickupInstructions: pickupInstructions?.trim() || 'Contact seller directly to arrange pickup time.',
        rating: 5.0,
        reviewCount: 1,
        createdAt: new Date().toISOString(),
      };

      if (isMongoConnected()) {
        const created = await Product.create(newProduct);
        return res.status(201).json(created);
      } else {
        const created = localDb.insert('products', newProduct);
        return res.status(201).json(created);
      }
    } catch (err) {
      console.error('[Products POST Error]', err);
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/products/:id
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (isMongoConnected()) {
        const updated = await Product.findByIdAndUpdate(id, updates, { new: true });
        if (!updated) return res.status(404).json({ error: 'Product not found.' });
        return res.json(updated);
      } else {
        const updated = localDb.update('products', id, updates);
        if (!updated) return res.status(404).json({ error: 'Product not found.' });
        return res.json(updated);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/products/:id
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (isMongoConnected()) {
        await Product.findByIdAndDelete(id);
        return res.json({ success: true, message: 'Listing deleted successfully.' });
      } else {
        const success = localDb.delete('products', id);
        return res.json({ success: true, message: 'Listing deleted successfully.' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
