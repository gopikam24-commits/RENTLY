import express from 'express';
import { User } from '../models/User.js';

const router = express.Router();

let memoryUsers = [
  {
    _id: 'u_demo_alex',
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    password: 'password123',
    phone: '+91 98765 43210',
    location: 'Anna Nagar, Chennai',
    avatar: 'https://picsum.photos/seed/useravatar/200/200',
    bio: 'Avid photographer & tech enthusiast. Love sharing gear and borrowing outdoor equipment!',
  },
];

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
          avatar: `https://picsum.photos/seed/${encodeURIComponent(normalizedEmail)}/200/200`,
          bio: 'Rently member ready to rent and share gear.',
        });
        return res.status(201).json(sanitizeUser(newUser));
      } else {
        const existing = memoryUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
        if (existing) {
          return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
        }
        const newUser = {
          _id: 'u_' + Date.now(),
          name: name.trim(),
          email: normalizedEmail,
          password,
          phone: phone || '+91 98765 43210',
          location: location || 'Anna Nagar, Chennai',
          avatar: `https://picsum.photos/seed/${encodeURIComponent(normalizedEmail)}/200/200`,
          bio: 'Rently member ready to rent and share gear.',
        };
        memoryUsers.push(newUser);
        return res.status(201).json(sanitizeUser(newUser));
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
        if (!user && normalizedEmail === 'alex.morgan@example.com') {
          if (password === 'password123') {
            return res.json({
              _id: 'u_demo_alex',
              name: 'Alex Morgan',
              email: 'alex.morgan@example.com',
              phone: '+91 98765 43210',
              location: 'Anna Nagar, Chennai',
              avatar: 'https://picsum.photos/seed/useravatar/200/200',
              bio: 'Avid photographer & tech enthusiast. Love sharing gear and borrowing outdoor equipment!',
            });
          }
        }
        if (!user) {
          return res.status(401).json({ error: 'No account found with this email. Please check your email or create an account.' });
        }
        if (user.password !== password) {
          return res.status(401).json({ error: 'Incorrect password. Please try again.' });
        }
        return res.json(sanitizeUser(user));
      } else {
        const user = memoryUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
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
        if (!user && normalizedEmail === 'alex.morgan@example.com') {
          user = await User.create({
            name: 'Alex Morgan',
            email: 'alex.morgan@example.com',
            password: newPassword,
            phone: '+91 98765 43210',
            location: 'Anna Nagar, Chennai',
            avatar: 'https://picsum.photos/seed/useravatar/200/200',
            bio: 'Avid photographer & tech enthusiast. Love sharing gear and borrowing outdoor equipment!',
          });
          return res.json({ success: true, message: 'Password updated successfully. You can now log in.' });
        }
        if (!user) {
          return res.status(404).json({ error: 'No account found with this email. Please check your email or sign up.' });
        }
        user.password = newPassword;
        await user.save();
        return res.json({ success: true, message: 'Password updated successfully. You can now log in.' });
      } else {
        const user = memoryUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
        if (!user) {
          return res.status(404).json({ error: 'No account found with this email. Please check your email or sign up.' });
        }
        user.password = newPassword;
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

        if (!user) {
          return res.status(404).json({ error: 'User not found.' });
        }
        return res.json(sanitizeUser(user));
      } else {
        let user;
        if (email) {
          user = memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
        } else if (id) {
          user = memoryUsers.find((u) => u._id === id);
        } else {
          user = memoryUsers[0];
        }

        if (!user) {
          return res.status(404).json({ error: 'User not found.' });
        }
        return res.json(sanitizeUser(user));
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/user/profile
  router.put('/profile', async (req, res) => {
    try {
      const { name, email, phone, location, bio, _id } = req.body;
      const updates = { name, phone, location, bio };
      const targetEmail = email ? email.toLowerCase().trim() : null;

      if (isMongoConnected()) {
        const query = _id ? { _id } : targetEmail ? { email: targetEmail } : {};
        const user = await User.findOneAndUpdate(query, updates, { new: true });
        if (!user) {
          return res.status(404).json({ error: 'User profile to update was not found.' });
        }
        return res.json(sanitizeUser(user));
      } else {
        const index = memoryUsers.findIndex((u) => (_id ? u._id === _id : targetEmail ? u.email.toLowerCase() === targetEmail : false));
        if (index === -1) {
          if (memoryUsers.length > 0) {
            memoryUsers[0] = { ...memoryUsers[0], ...updates };
            return res.json(sanitizeUser(memoryUsers[0]));
          }
          return res.status(404).json({ error: 'User not found.' });
        }
        memoryUsers[index] = { ...memoryUsers[index], ...updates };
        return res.json(sanitizeUser(memoryUsers[index]));
      }
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  return router;
}
