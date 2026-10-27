import express from 'express';
import { sqliteRentals } from '../config/sqliteDb.js';

const router = express.Router();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getRentalRouter(isMongoConnected) {
  // GET /api/rentals
  router.get('/', async (req, res) => {
    try {
      const { renterEmail, sellerEmail, userEmail } = req.query;
      const rentals = await sqliteRentals.getAll({ renterEmail, sellerEmail, userEmail });
      return res.json(rentals);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/admin/all
  router.get('/admin/all', async (req, res) => {
    try {
      const rentals = await sqliteRentals.getAll();
      return res.json(rentals);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/rentals
  router.post('/', async (req, res) => {
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
      } = req.body;

      if (!productId || !productTitle || !startDate || !days || !totalPrice) {
        return res.status(400).json({ error: 'Please provide all booking details.' });
      }

      const pickupOtp = generateOtp();
      const returnOtp = generateOtp();

      const created = await sqliteRentals.create({
        productId,
        productTitle,
        productImage: productImage || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
        renterId: renterId || '',
        renterName: renterName || 'Customer',
        renterEmail: renterEmail?.toLowerCase().trim() || '',
        renterPhone: renterPhone || '+91 98765 43210',
        sellerId: sellerId || '',
        sellerName: sellerName || 'Owner',
        sellerEmail: sellerEmail?.toLowerCase().trim() || '',
        sellerPhone: sellerPhone || '+91 98401 23456',
        sellerAddress: sellerAddress || 'Local Address',
        startDate,
        days: Number(days),
        totalPrice: Number(totalPrice),
        advanceDeposit: Number(advanceDeposit) || 0,
        pickupOtp,
        returnOtp,
        messages: [
          {
            sender: 'System / Rently Platform',
            senderEmail: 'system@rently.com',
            text: `Booking initiated for "${productTitle}". Secret Pickup OTP sent to customer. Private chat established between Owner (${sellerName || 'Owner'}) and Customer (${renterName || 'Customer'}).`,
            isProof: false,
            createdAt: new Date().toISOString(),
          },
        ],
      });

      return res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/rentals/:id/verify-pickup
  router.post('/:id/verify-pickup', async (req, res) => {
    try {
      const { otp, photos } = req.body;
      const id = req.params.id;

      if (!otp) {
        return res.status(400).json({ error: 'Please enter the 6-digit Pickup OTP provided by the customer.' });
      }

      const rental = await sqliteRentals.getById(id);
      if (!rental) return res.status(404).json({ error: 'Booking not found' });
      if (rental.pickupOtp !== String(otp).trim()) {
        return res.status(400).json({ error: 'Incorrect Pickup OTP. Please ask the customer to read the 6-digit OTP from their screen.' });
      }

      const finalPhotos = Array.isArray(photos) && photos.length > 0
        ? photos
        : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'];

      const messages = [...(rental.messages || [])];
      messages.push({
        sender: `${rental.sellerName} (Owner)`,
        senderEmail: rental.sellerEmail,
        text: '📸 Initial Pickup Condition Proof recorded. Safe handover complete.',
        photos: finalPhotos,
        isProof: true,
        createdAt: new Date().toISOString(),
      });

      const updated = await sqliteRentals.update(id, {
        pickupVerified: true,
        pickupPhotos: finalPhotos,
        pickupTimestamp: new Date().toISOString(),
        status: 'Active',
        messages,
      });

      return res.json({
        success: true,
        message: `✓ Pickup Confirmed! Handover verified for "${rental.productTitle}".`,
        rental: updated,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/rentals/:id/verify-return
  router.post('/:id/verify-return', async (req, res) => {
    try {
      const { otp } = req.body;
      const id = req.params.id;

      if (!otp) {
        return res.status(400).json({ error: 'Please enter the 6-digit Return OTP provided by the owner/seller.' });
      }

      const rental = await sqliteRentals.getById(id);
      if (!rental) return res.status(404).json({ error: 'Booking not found' });
      if (rental.returnOtp !== String(otp).trim()) {
        return res.status(400).json({ error: 'Incorrect Return OTP. Please ask the seller to provide the 6-digit Return OTP shown on their screen.' });
      }

      const messages = [...(rental.messages || [])];
      messages.push({
        sender: 'System / Rently Platform',
        senderEmail: 'system@rently.com',
        text: `✓ Return Confirmed & Completed. "${rental.productTitle}" has been returned to owner ${rental.sellerName}. Refundable advance settled.`,
        isProof: false,
        createdAt: new Date().toISOString(),
      });

      const updated = await sqliteRentals.update(id, {
        returnVerified: true,
        depositRefunded: true,
        returnTimestamp: new Date().toISOString(),
        status: 'Completed',
        messages,
      });

      return res.json({
        success: true,
        message: `✓ Return Confirmed! "${rental.productTitle}" has been returned to ${rental.sellerName}. Rental successfully completed.`,
        rental: updated,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/rentals/:id/messages
  router.post('/:id/messages', async (req, res) => {
    try {
      const { sender, senderEmail, text, photos } = req.body;
      const id = req.params.id;

      if (!text && (!photos || !photos.length)) {
        return res.status(400).json({ error: 'Message text or photo is required.' });
      }

      const rental = await sqliteRentals.getById(id);
      if (!rental) return res.status(404).json({ error: 'Booking not found' });

      const newMsg = {
        sender: sender || 'User',
        senderEmail: senderEmail || '',
        text: text || '',
        photos: Array.isArray(photos) ? photos : [],
        isProof: false,
        createdAt: new Date().toISOString(),
      };

      const messages = [...(rental.messages || []), newMsg];
      const updated = await sqliteRentals.update(id, { messages });

      return res.json({ success: true, message: newMsg, rental: updated });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
