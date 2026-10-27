import express from 'express';
import { User } from '../models/User.js';
import { localDb } from '../config/localDb.js';

const router = express.Router();

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

export function getUserRouter(isMongoConnected) {
  // POST /api/user/register
  router.post('/register', async (req, res) => {
    try {
      const { name, email, password, phone, location } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (isMongoConnected()) {
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
          return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
        }
        const newUser = await User.create({
          name: name.trim(),
          email: normalizedEmail,
          password,
          phone: phone || '+91 98765 43210',
          location: location || 'Anna Nagar, Chennai',
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
          bio: 'Rently member ready to rent and share gear.',
        });
        return res.status(201).json(sanitizeUser(newUser));
      } else {
        const existing = localDb.findOne('users', (u) => u.email?.toLowerCase().trim() === normalizedEmail);
        if (existing) {
          return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
        }
        const newUser = {
          name: name.trim(),
          email: normalizedEmail,
          password,
          phone: phone || '+91 98765 43210',
          location: location || 'Anna Nagar, Chennai',
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
          bio: 'Rently member ready to rent and share gear.',
        };
        const created = localDb.insert('users', newUser);
        return res.status(201).json(sanitizeUser(created));
      }
    } catch (err) {
      console.error('[Register Error]', err);
      return res.status(500).json({ error: err.message || 'Registration failed.' });
    }
  });

  // POST /api/user/login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (isMongoConnected()) {
        let user = await User.findOne({ email: normalizedEmail });
        if (!user && normalizedEmail === 'alex.morgan@example.com' && password === 'password123') {
          user = await User.create({
            name: 'Alex Morgan',
            email: 'alex.morgan@example.com',
            password: 'password123',
            phone: '+91 98765 43210',
            location: 'Anna Nagar, Chennai',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            bio: 'Avid photographer & tech enthusiast. Love sharing gear and borrowing outdoor equipment!',
          });
        }
        if (!user) {
          return res.status(401).json({ error: 'No account found with this email. Please check your email or create an account.' });
        }
        if (user.password !== password) {
          return res.status(401).json({ error: 'Incorrect password. Please try again.' });
        }
        return res.json(sanitizeUser(user));
      } else {
        const user = localDb.findOne('users', (u) => u.email?.toLowerCase().trim() === normalizedEmail);
        if (!user) {
          return res.status(401).json({ error: 'No account found with this email. Please check your email or create an account.' });
        }
        if (user.password !== password) {
          return res.status(401).json({ error: 'Incorrect password. Please try again.' });
        }
        return res.json(sanitizeUser(user));
      }
    } catch (err) {
      console.error('[Login Error]', err);
      return res.status(500).json({ error: err.message || 'Login failed.' });
    }
  });

  // POST /api/user/reset-password
  router.post('/reset-password', async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email and new password are required.' });
      }
      if (newPassword.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (isMongoConnected()) {
        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
          return res.status(404).json({ error: 'No account found with this email. Please check your email or sign up.' });
        }
        user.password = newPassword;
        await user.save();
        return res.json({ success: true, message: 'Password updated successfully. You can now log in.' });
      } else {
        const user = localDb.findOne('users', (u) => u.email?.toLowerCase().trim() === normalizedEmail);
        if (!user) {
          return res.status(404).json({ error: 'No account found with this email. Please check your email or sign up.' });
        }
        localDb.update('users', user._id || user.id, { password: newPassword });
        return res.json({ success: true, message: 'Password updated successfully. You can now log in.' });
      }
    } catch (err) {
      console.error('[Reset Password Error]', err);
      return res.status(500).json({ error: err.message || 'Password reset failed.' });
    }
  });

  // GET /api/user/profile
  router.get('/profile', async (req, res) => {
    try {
      const { email, id } = req.query;

      if (isMongoConnected()) {
        let user;
        if (email) {
          user = await User.findOne({ email: email.toLowerCase().trim() });
        } else if (id) {
          user = await User.findById(id);
        } else {
          user = await User.findOne();
        }

        if (!user) return res.status(404).json({ error: 'User not found.' });
        return res.json(sanitizeUser(user));
      } else {
        let user;
        if (email) {
          user = localDb.findOne('users', (u) => u.email?.toLowerCase().trim() === email.toLowerCase().trim());
        } else if (id) {
          user = localDb.findById('users', id);
        } else {
          const all = localDb.read('users');
          user = all[0];
        }

        if (!user) return res.status(404).json({ error: 'User not found.' });
        return res.json(sanitizeUser(user));
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/user/profile
  router.put('/profile', async (req, res) => {
    try {
      const { name, email, phone, location, bio, _id, id } = req.body;
      const updates = {};
      if (name) updates.name = name.trim();
      if (phone) updates.phone = phone.trim();
      if (location) updates.location = location.trim();
      if (bio) updates.bio = bio.trim();

      const targetId = _id || id;
      const targetEmail = email ? email.toLowerCase().trim() : null;

      if (isMongoConnected()) {
        const query = targetId ? { _id: targetId } : targetEmail ? { email: targetEmail } : {};
        const user = await User.findOneAndUpdate(query, updates, { new: true });
        if (!user) return res.status(404).json({ error: 'User profile to update was not found.' });
        return res.json(sanitizeUser(user));
      } else {
        let user = targetId
          ? localDb.findById('users', targetId)
          : targetEmail
          ? localDb.findOne('users', (u) => u.email?.toLowerCase().trim() === targetEmail)
          : null;

        if (!user) {
          const all = localDb.read('users');
          if (all.length > 0) user = all[0];
        }

        if (!user) return res.status(404).json({ error: 'User not found.' });

        const updated = localDb.update('users', user._id || user.id, updates);
        return res.json(sanitizeUser(updated));
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  return router;
}
