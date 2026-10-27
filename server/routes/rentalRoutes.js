import express from 'express';
import { Rental } from '../models/Rental.js';
import { localDb } from '../config/localDb.js';

const router = express.Router();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getRentalRouter(isMongoConnected) {
  // GET /api/rentals
  router.get('/', async (req, res) => {
    try {
      const { renterEmail, sellerEmail, userEmail } = req.query;
      if (isMongoConnected()) {
        let filter = {};
        if (userEmail) {
          filter = { $or: [{ renterEmail: userEmail }, { sellerEmail: userEmail }] };
        } else if (renterEmail) {
          filter.renterEmail = renterEmail;
        } else if (sellerEmail) {
          filter.sellerEmail = sellerEmail;
        }
        const rentals = await Rental.find(filter).sort({ createdAt: -1 });
        return res.json(rentals);
      } else {
        let list = localDb.read('rentals');
        if (userEmail) {
          const u = userEmail.toLowerCase().trim();
          list = list.filter((r) => r.renterEmail?.toLowerCase().trim() === u || r.sellerEmail?.toLowerCase().trim() === u);
        } else if (renterEmail) {
          const r = renterEmail.toLowerCase().trim();
          list = list.filter((item) => item.renterEmail?.toLowerCase().trim() === r);
        } else if (sellerEmail) {
          const s = sellerEmail.toLowerCase().trim();
          list = list.filter((item) => item.sellerEmail?.toLowerCase().trim() === s);
        }
        return res.json(list);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/admin/all
  router.get('/admin/all', async (req, res) => {
    try {
      if (isMongoConnected()) {
        const rentals = await Rental.find().sort({ createdAt: -1 });
        return res.json(rentals);
      } else {
        return res.json(localDb.read('rentals'));
      }
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
      const generatedId = `r_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const newBooking = {
        _id: generatedId,
        id: generatedId,
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
        depositRefunded: false,
        pickupOtp,
        pickupVerified: false,
        pickupPhotos: [],
        returnOtp,
        returnVerified: false,
        returnPhotos: [],
        status: 'Pickup Pending',
        messages: [
          {
            sender: 'System / Rently Platform',
            senderEmail: 'system@rently.com',
            text: `Booking initiated for "${productTitle}". Secret Pickup OTP sent to customer. Private chat established between Owner (${sellerName || 'Owner'}) and Customer (${renterName || 'Customer'}).`,
            isProof: false,
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
      };

      if (isMongoConnected()) {
        const created = await Rental.create(newBooking);
        return res.status(201).json(created);
      } else {
        const created = localDb.insert('rentals', newBooking);
        return res.status(201).json(created);
      }
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

      const finalPhotos = Array.isArray(photos) && photos.length > 0
        ? photos
        : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'];

      if (isMongoConnected()) {
        const rental = await Rental.findById(id);
        if (!rental) return res.status(404).json({ error: 'Booking not found' });
        if (rental.pickupOtp !== String(otp).trim()) {
          return res.status(400).json({ error: 'Incorrect Pickup OTP. Please ask the customer to read the 6-digit OTP from their screen.' });
        }

        rental.pickupVerified = true;
        rental.pickupPhotos = finalPhotos;
        rental.pickupTimestamp = new Date();
        rental.status = 'Active';

        if (!rental.messages) rental.messages = [];
        rental.messages.push({
          sender: `${rental.sellerName} (Owner)`,
          senderEmail: rental.sellerEmail,
          text: '📸 Initial Pickup Condition Proof recorded. Safe handover complete.',
          photos: finalPhotos,
          isProof: true,
          createdAt: new Date(),
        });

        await rental.save();

        return res.json({
          success: true,
          message: `✓ Pickup Confirmed! Handover verified for "${rental.productTitle}".`,
          rental,
        });
      } else {
        const rental = localDb.findById('rentals', id);
        if (!rental) return res.status(404).json({ error: 'Booking not found' });
        if (rental.pickupOtp !== String(otp).trim()) {
          return res.status(400).json({ error: 'Incorrect Pickup OTP. Please ask the customer to read the 6-digit OTP from their screen.' });
        }

        const messages = [...(rental.messages || [])];
        messages.push({
          sender: `${rental.sellerName} (Owner)`,
          senderEmail: rental.sellerEmail,
          text: '📸 Initial Pickup Condition Proof recorded. Safe handover complete.',
          photos: finalPhotos,
          isProof: true,
          createdAt: new Date().toISOString(),
        });

        const updated = localDb.update('rentals', id, {
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
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/rentals/:id/verify-return
  router.post('/:id/verify-return', async (req, res) => {
    try {
      const { otp, photos } = req.body;
      const id = req.params.id;

      if (!otp) {
        return res.status(400).json({ error: 'Please enter the 6-digit Return OTP provided by the owner/seller.' });
      }

      if (isMongoConnected()) {
        const rental = await Rental.findById(id);
        if (!rental) return res.status(404).json({ error: 'Booking not found' });
        if (rental.returnOtp !== String(otp).trim()) {
          return res.status(400).json({ error: 'Incorrect Return OTP. Please ask the seller to provide the 6-digit Return OTP shown on their screen.' });
        }

        rental.returnVerified = true;
        rental.depositRefunded = true;
        rental.returnTimestamp = new Date();
        rental.status = 'Completed';

        if (!rental.messages) rental.messages = [];
        rental.messages.push({
          sender: 'System / Rently Platform',
          senderEmail: 'system@rently.com',
          text: `✓ Return Confirmed & Completed. "${rental.productTitle}" has been returned to owner ${rental.sellerName}. Refundable advance settled.`,
          isProof: false,
          createdAt: new Date(),
        });

        await rental.save();

        return res.json({
          success: true,
          message: `✓ Return Confirmed! "${rental.productTitle}" has been returned to ${rental.sellerName}. Rental successfully completed.`,
          rental,
        });
      } else {
        const rental = localDb.findById('rentals', id);
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

        const updated = localDb.update('rentals', id, {
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
      }
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

      const newMsg = {
        sender: sender || 'User',
        senderEmail: senderEmail || '',
        text: text || '',
        photos: Array.isArray(photos) ? photos : [],
        isProof: false,
        createdAt: new Date().toISOString(),
      };

      if (isMongoConnected()) {
        const rental = await Rental.findById(id);
        if (!rental) return res.status(404).json({ error: 'Booking not found' });

        if (!rental.messages) rental.messages = [];
        rental.messages.push(newMsg);
        await rental.save();

        return res.json({ success: true, message: newMsg, rental });
      } else {
        const rental = localDb.findById('rentals', id);
        if (!rental) return res.status(404).json({ error: 'Booking not found' });

        const messages = [...(rental.messages || []), newMsg];
        const updated = localDb.update('rentals', id, { messages });

        return res.json({ success: true, message: newMsg, rental: updated });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
