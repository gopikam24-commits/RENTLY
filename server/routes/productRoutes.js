import express from 'express';
import { sqliteProducts } from '../config/sqliteDb.js';

const router = express.Router();

export function getProductRouter(isMongoConnected) {
  // GET /api/products
  router.get('/', async (req, res) => {
    try {
      const { search, radius, sort, tag, sellerEmail, sellerId } = req.query;
      const products = await sqliteProducts.getAll({ search, radius, sort, tag, sellerEmail, sellerId });
      return res.json(products);
    } catch (err) {
      console.error('[Products GET Error]', err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/products/:id
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await sqliteProducts.getById(id);
      if (!product) return res.status(404).json({ error: 'Product not found.' });
      return res.json(product);
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

      const created = await sqliteProducts.create({
        title,
        price,
        priceUnit,
        advanceDeposit,
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
      });

      return res.status(201).json(created);
    } catch (err) {
      console.error('[Products POST Error]', err);
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/products/:id
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await sqliteProducts.delete(id);
      return res.json({ success: true, message: 'Listing deleted successfully.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
