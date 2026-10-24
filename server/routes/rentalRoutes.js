import express from 'express';
import { Rental } from '../models/Rental.js';

const router = express.Router();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

let memoryRentals = [
  {
    _id: 'r_sample_1',
    productId: 'p1',
    productTitle: 'Canon EOS R6 Mirrorless Camera',
    renterName: 'Alex Morgan',
    renterEmail: 'alex.morgan@example.com',
    renterPhone: '+91 91234 56789',
    sellerName: 'Rajesh Kumar',
    sellerEmail: 'rajesh.camera@example.com',
    sellerPhone: '+91 98401 23456',
    sellerAddress: 'Plot 42, 2nd Main Road, Anna Nagar, Chennai',
    startDate: new Date().toISOString().split('T')[0],
    days: 2,
    totalPrice: 1900,
    pickupOtp: '849201',
    pickupVerified: true,
    pickupPhotos: [
      'https://picsum.photos/seed/pickup_cam1/600/400',
      'https://picsum.photos/seed/pickup_cam2/600/400'
    ],
    pickupTimestamp: new Date(),
    returnOtp: '391042',
    returnVerified: false,
    returnPhotos: [],
    status: 'Active',
    messages: [
      {
        sender: 'System / Rently Platform',
        senderEmail: 'system@rently.com',
        text: 'Rental request created. Pickup OTP generated for customer. Private chat between Seller & Receiver established.',
        isProof: false,
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        sender: 'Rajesh Kumar (Owner)',
        senderEmail: 'rajesh.camera@example.com',
        text: '📸 Initial Pickup Condition Proof uploaded. These photos serve as mutual evidence to check for any damages upon return.',
        photos: [
          'https://picsum.photos/seed/pickup_cam1/600/400',
          'https://picsum.photos/seed/pickup_cam2/600/400'
        ],
        isProof: true,
        createdAt: new Date(Date.now() - 1800000),
      }
    ],
    createdAt: new Date(),
  },
];

export function getRentalRouter(isMongoConnected) {
  // GET /api/rentals (optional email query parameter to filter by user)
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
        if (userEmail) {
          const list = memoryRentals.filter(
            (r) => r.renterEmail === userEmail || r.sellerEmail === userEmail
          );
          return res.json(list);
        }
        if (renterEmail) {
          const list = memoryRentals.filter((r) => r.renterEmail === renterEmail);
          return res.json(list);
        }
        if (sellerEmail) {
          const list = memoryRentals.filter((r) => r.sellerEmail === sellerEmail);
          return res.json(list);
        }
        return res.json(memoryRentals);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/admin/rentals (All Rentals for Admin Audit)
  router.get('/admin/all', async (req, res) => {
    try {
      if (isMongoConnected()) {
        const rentals = await Rental.find().sort({ createdAt: -1 });
        return res.json(rentals);
      } else {
        return res.json(memoryRentals);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/rentals (Book rental - accepts renterName, renterEmail, renterPhone, sellerEmail)
  router.post('/', async (req, res) => {
    try {
      const {
        productId,
        productTitle,
        renterName,
        renterEmail,
        renterPhone,
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

      const newBooking = {
        productId,
        productTitle,
        renterName: renterName || 'Alex Morgan',
        renterEmail: renterEmail || 'alex.morgan@example.com',
        renterPhone: renterPhone || '+91 91234 56789',
        sellerName: sellerName || 'Rajesh Kumar',
        sellerEmail: sellerEmail || 'rajesh.camera@example.com',
        sellerPhone: sellerPhone || '+91 98401 23456',
        sellerAddress: sellerAddress || 'Anna Nagar, Chennai',
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
            text: `Booking initiated for "${productTitle}". Private chat established between Owner (${sellerName || 'Owner'}) and Customer (${renterName || 'Customer'}).`,
            isProof: false,
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
      };

      if (isMongoConnected()) {
        const created = await Rental.create(newBooking);
        return res.status(201).json(created);
      } else {
        const created = { ...newBooking, _id: `r_${Date.now()}` };
        memoryRentals.unshift(created);
        return res.status(201).json(created);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/rentals/:id/verify-pickup (Owner uploads condition proof photos & enters Pickup OTP)
  router.post('/:id/verify-pickup', async (req, res) => {
    try {
      const { otp, photos } = req.body;
      const id = req.params.id;

      if (!otp) {
        return res.status(400).json({ error: 'Please enter the 6-digit Pickup OTP provided by the customer.' });
      }

      const finalPhotos = Array.isArray(photos) && photos.length > 0
        ? photos
        : ['https://picsum.photos/seed/proof_' + Date.now() + '/600/400'];

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

        // Add condition proof message to private chat
        if (!rental.messages) rental.messages = [];
        rental.messages.push({
          sender: `${rental.sellerName} (Owner)`,
          senderEmail: rental.sellerEmail,
          text: '📸 Initial Pickup Condition Proof uploaded. These photos serve as mutual evidence to check for any damages upon return.',
          photos: finalPhotos,
          isProof: true,
          createdAt: new Date(),
        });

        await rental.save();

        return res.json({
          success: true,
          message: `✓ Pickup Confirmed! Condition proof photos recorded in your private chat. You can now safely hand over "${rental.productTitle}" to customer ${rental.renterName}.`,
          rental,
        });
      } else {
        const rental = memoryRentals.find((r) => String(r._id) === String(id));
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
          text: '📸 Initial Pickup Condition Proof uploaded. These photos serve as mutual evidence to check for any damages upon return.',
          photos: finalPhotos,
          isProof: true,
          createdAt: new Date(),
        });

        return res.json({
          success: true,
          message: `✓ Pickup Confirmed! Condition proof photos recorded in your private chat. You can now safely hand over "${rental.productTitle}" to customer ${rental.renterName}.`,
          rental,
        });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/rentals/:id/verify-return (Customer enters Return OTP - NO photo upload required)
  router.post('/:id/verify-return', async (req, res) => {
    try {
      const { otp } = req.body;
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
          text: `✓ Return Confirmed & Completed. "${rental.productTitle}" has been returned to owner ${rental.sellerName}. Refundable advance of ₹${rental.advanceDeposit || 0} settled.`,
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
        const rental = memoryRentals.find((r) => String(r._id) === String(id));
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
          text: `✓ Return Confirmed & Completed. "${rental.productTitle}" has been returned to owner ${rental.sellerName}. Refundable advance of ₹${rental.advanceDeposit || 0} settled.`,
          isProof: false,
          createdAt: new Date(),
        });

        return res.json({
          success: true,
          message: `✓ Return Confirmed! "${rental.productTitle}" has been returned to ${rental.sellerName}. Rental successfully completed.`,
          rental,
        });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/rentals/:id/messages (Private chat message between Owner and Receiver)
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
        createdAt: new Date(),
      };

      if (isMongoConnected()) {
        const rental = await Rental.findById(id);
        if (!rental) return res.status(404).json({ error: 'Booking not found' });

        // Privacy check: sender must be seller or renter
        const curEmail = (senderEmail || '').toLowerCase().trim();
        const rEmail = (rental.renterEmail || '').toLowerCase().trim();
        const sEmail = (rental.sellerEmail || '').toLowerCase().trim();
        if (curEmail && curEmail !== rEmail && curEmail !== sEmail) {
          return res.status(403).json({ error: 'Access denied: Private chat is only visible to the seller and receiver.' });
        }

        if (!rental.messages) rental.messages = [];
        rental.messages.push(newMsg);
        await rental.save();

        return res.json({ success: true, message: newMsg, rental });
      } else {
        const rental = memoryRentals.find((r) => String(r._id) === String(id));
        if (!rental) return res.status(404).json({ error: 'Booking not found' });

        const curEmail = (senderEmail || '').toLowerCase().trim();
        const rEmail = (rental.renterEmail || '').toLowerCase().trim();
        const sEmail = (rental.sellerEmail || '').toLowerCase().trim();
        if (curEmail && curEmail !== rEmail && curEmail !== sEmail) {
          return res.status(403).json({ error: 'Access denied: Private chat is only visible to the seller and receiver.' });
        }

        if (!rental.messages) rental.messages = [];
        rental.messages.push(newMsg);

        return res.json({ success: true, message: newMsg, rental });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

