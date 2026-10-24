import express from 'express';
import { Product } from '../models/Product.js';
import { INITIAL_PRODUCTS } from '../seed.js';

const router = express.Router();

let memoryProducts = [...INITIAL_PRODUCTS.map((p, idx) => ({ ...p, _id: `p${idx + 1}` }))];

export function getProductRouter(isMongoConnected) {
  // GET /api/products
  router.get('/', async (req, res) => {
    try {
      const { search, radius, sort, tag } = req.query;

      if (isMongoConnected()) {
        let filter = {};
        if (search) filter.title = { $regex: search, $options: 'i' };
        if (radius) filter.distanceKm = { $lte: Number(radius) };
        if (tag) filter.tag = tag;

        let sortOption = {};
        if (sort === 'low') sortOption.price = 1;
        if (sort === 'high') sortOption.price = -1;

        const products = await Product.find(filter).sort(sortOption);
        return res.json(products);
      } else {
        let list = [...memoryProducts];
        if (search) list = list.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
        if (radius) list = list.filter((p) => p.distanceKm <= Number(radius));
        if (tag) list = list.filter((p) => p.tag === tag);
        if (sort === 'low') list.sort((a, b) => a.price - b.price);
        if (sort === 'high') list.sort((a, b) => b.price - a.price);
        return res.json(list);
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

      const newProduct = {
        title,
        price: Number(price),
        priceUnit: priceUnit || 'day',
        advanceDeposit: Number(advanceDeposit) || 0,
        location,
        distanceKm: Number(distanceKm) || Math.floor(Math.random() * 15) + 1,
        tag,
        description,
        images: images && images.length ? images : ['https://picsum.photos/seed/item' + Date.now() + '/700/500'],
        sellerName: sellerName || 'Rajesh Kumar',
        sellerPhone: sellerPhone || '+91 98401 23456',
        sellerEmail: sellerEmail || 'rajesh.camera@example.com',
        sellerAddress: sellerAddress || location,
        pickupInstructions: pickupInstructions || 'Contact seller directly to arrange pickup time.',
        rating: 5.0,
        reviewCount: 1,
        createdAt: new Date(),
      };

      if (isMongoConnected()) {
        const created = await Product.create(newProduct);
        return res.status(201).json(created);
      } else {
        const created = { ...newProduct, _id: `p${Date.now()}` };
        memoryProducts.unshift(created);
        return res.status(201).json(created);
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
        memoryProducts = memoryProducts.filter((p) => p._id !== id && p.id !== id);
        return res.json({ success: true, message: 'Listing deleted successfully.' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
