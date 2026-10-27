import express from 'express';
import { sqliteUsers } from '../config/sqliteDb.js';

const router = express.Router();

const sanitizeUser = (user) => {
  if (!user) return null;
  const obj = { ...user };
  delete obj.password;
  obj._id = obj.id;
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
      const existing = await sqliteUsers.findByEmail(normalizedEmail);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
      }

      const created = await sqliteUsers.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        phone: phone || '+91 98765 43210',
        location: location || 'Anna Nagar, Chennai',
      });

      return res.status(201).json(sanitizeUser(created));
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
      const user = await sqliteUsers.findByEmail(normalizedEmail);

      if (!user) {
        return res.status(401).json({ error: 'No account found with this email. Please check your email or create an account.' });
      }
      if (user.password !== password) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }

      return res.json(sanitizeUser(user));
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
      const user = await sqliteUsers.findByEmail(normalizedEmail);
      if (!user) {
        return res.status(404).json({ error: 'No account found with this email. Please check your email or sign up.' });
      }

      await sqliteUsers.updatePassword(normalizedEmail, newPassword);
      return res.json({ success: true, message: 'Password updated successfully. You can now log in.' });
    } catch (err) {
      console.error('[Reset Password Error]', err);
      return res.status(500).json({ error: err.message || 'Password reset failed.' });
    }
  });

  // GET /api/user/profile
  router.get('/profile', async (req, res) => {
    try {
      const { email, id } = req.query;
      let user = null;
      if (email) {
        user = await sqliteUsers.findByEmail(email);
      } else if (id) {
        user = await sqliteUsers.findById(id);
      } else {
        user = await sqliteUsers.findById('u_demo_alex');
      }

      if (!user) return res.status(404).json({ error: 'User not found.' });
      return res.json(sanitizeUser(user));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/user/profile
  router.put('/profile', async (req, res) => {
    try {
      const { name, email, phone, location, bio, _id, id } = req.body;
      const targetId = _id || id;
      let user = null;

      if (targetId) {
        user = await sqliteUsers.findById(targetId);
      } else if (email) {
        user = await sqliteUsers.findByEmail(email);
      }

      if (!user) return res.status(404).json({ error: 'User profile not found.' });

      const updated = await sqliteUsers.updateProfile(user.id, { name, phone, location, bio });
      return res.json(sanitizeUser(updated));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  return router;
}
