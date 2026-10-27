import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}

const url = process.env.TURSO_DATABASE_URL || process.env.SQLITE_URL || 'libsql://rental-gopika.aws-ap-south-1.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMxMTEwMTcsImlkIjoiMDFhMTdkYmQtY2IwMS03ZjBjLThkNjEtYzNjYjBmMGJkYTc4Iiwia2lkIjoiM1hKNFMxSmo5MTZxRG5TMzhBM3ZMcmhlMkNyd1ZzNHZqNmI1UWJhN25xUSIsInJpZCI6IjA2MzlmMWE0LTAzZDgtNDA0Zi04NjRlLTNmOWRhNDVlNDIwYiJ9.0WMBWABbz9sciD38FQwBPvqRaWHBQUAAG6jG6SQRlBITdfv7SBehjECxrKVwDSWaBo2ON0hSWRJMePRTu-J-Dw';

export const client = createClient({
  url,
  authToken,
});

export const isCloudSqlite = Boolean(url.startsWith('libsql://') || url.startsWith('https://'));

console.log(`[SQLite Database] Connected to: ${isCloudSqlite ? 'Turso Cloud SQLite (' + url + ')' : 'SQLite Database (' + url + ')'}`);

// Initialize tables
export async function initDb() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        location TEXT,
        avatar TEXT,
        bio TEXT,
        createdAt TEXT
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        priceUnit TEXT DEFAULT 'day',
        advanceDeposit REAL DEFAULT 0,
        location TEXT NOT NULL,
        distanceKm REAL NOT NULL,
        tag TEXT NOT NULL,
        description TEXT NOT NULL,
        images TEXT,
        sellerId TEXT,
        sellerName TEXT,
        sellerPhone TEXT,
        sellerEmail TEXT,
        sellerAddress TEXT,
        pickupInstructions TEXT,
        rating REAL DEFAULT 5.0,
        reviewCount INTEGER DEFAULT 1,
        createdAt TEXT
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS rentals (
        id TEXT PRIMARY KEY,
        productId TEXT NOT NULL,
        productTitle TEXT NOT NULL,
        productImage TEXT,
        renterId TEXT,
        renterName TEXT,
        renterEmail TEXT,
        renterPhone TEXT,
        sellerId TEXT,
        sellerName TEXT,
        sellerEmail TEXT,
        sellerPhone TEXT,
        sellerAddress TEXT,
        startDate TEXT,
        days INTEGER DEFAULT 1,
        totalPrice REAL NOT NULL,
        advanceDeposit REAL DEFAULT 0,
        depositRefunded INTEGER DEFAULT 0,
        pickupOtp TEXT,
        pickupVerified INTEGER DEFAULT 0,
        pickupPhotos TEXT,
        pickupTimestamp TEXT,
        returnOtp TEXT,
        returnVerified INTEGER DEFAULT 0,
        returnPhotos TEXT,
        returnTimestamp TEXT,
        status TEXT DEFAULT 'Pickup Pending',
        messages TEXT,
        createdAt TEXT
      );
    `);

    // Seed default users if empty
    const usersCountRes = await client.execute('SELECT COUNT(*) as count FROM users');
    const usersCount = Number(usersCountRes.rows[0]?.count || 0);
    if (usersCount === 0) {
      await client.execute({
        sql: `INSERT INTO users (id, name, email, password, phone, location, avatar, bio, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'u_demo_alex',
          'Alex Morgan',
          'alex.morgan@example.com',
          'password123',
          '+91 98765 43210',
          'Anna Nagar, Chennai',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          'Avid photographer & tech enthusiast. Love sharing gear and borrowing outdoor equipment!',
          new Date().toISOString(),
        ],
      });
      await client.execute({
        sql: `INSERT INTO users (id, name, email, password, phone, location, avatar, bio, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'u_demo_rajesh',
          'Rajesh Kumar',
          'rajesh.camera@example.com',
          'password123',
          '+91 98401 23456',
          'Perur, Coimbatore',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          'Professional filmmaker & drone pilot renting high-end production equipment.',
          new Date().toISOString(),
        ],
      });
    }

    // Seed default products if empty
    const prodCountRes = await client.execute('SELECT COUNT(*) as count FROM products');
    const prodCount = Number(prodCountRes.rows[0]?.count || 0);
    if (prodCount === 0) {
      const defaultProducts = [
        {
          id: 'p_demo_1',
          title: 'Sony Alpha A7 IV Mirrorless Camera + 24-70mm GM Lens',
          price: 1500,
          priceUnit: 'day',
          advanceDeposit: 5000,
          location: 'Perur, Coimbatore',
          distanceKm: 2,
          tag: 'Photography',
          description: '33MP full-frame hybrid camera with 4K 60p 10-bit video, pristine Sony G Master 24-70mm f/2.8 lens, 2x 128GB V90 cards, 3 batteries, and dual charger. Perfect for weddings and shoots.',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
          ]),
          sellerId: 'u_demo_rajesh',
          sellerName: 'Rajesh Kumar',
          sellerPhone: '+91 98401 23456',
          sellerEmail: 'rajesh.camera@example.com',
          sellerAddress: 'Perur, Coimbatore',
          pickupInstructions: 'Available for handover from 7:00 AM. Original Govt ID verification required at pickup.',
          rating: 5.0,
          reviewCount: 14,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'p_demo_2',
          title: 'DJI Mini 3 Pro Drone Combo + RC Smart Controller',
          price: 1800,
          priceUnit: 'day',
          advanceDeposit: 6000,
          location: 'Anna Nagar, Chennai',
          distanceKm: 5,
          tag: 'Drones',
          description: 'Sub-249g lightweight 4K HDR drone with tri-directional obstacle sensing, true vertical shooting, 3 intelligent flight batteries (34 mins each), ND filter kit, and shoulder bag.',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80',
          ]),
          sellerId: 'u_demo_alex',
          sellerName: 'Alex Morgan',
          sellerPhone: '+91 98765 43210',
          sellerEmail: 'alex.morgan@example.com',
          sellerAddress: 'Anna Nagar, Chennai',
          pickupInstructions: 'Pick up near 2nd Avenue Metro station. Drone test flight demonstrated at handover.',
          rating: 4.9,
          reviewCount: 8,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'p_demo_3',
          title: 'Quechua 4-Person Waterproof Camping Tent & Dual Sleeping Bags',
          price: 450,
          priceUnit: 'day',
          advanceDeposit: 1500,
          location: 'Gandhipuram, Coimbatore',
          distanceKm: 4,
          tag: 'Camping & Outdoors',
          description: 'FreshDecath waterproof 4-person dome tent with blackout technology, 2 self-inflating camp mattresses, 2 compact thermal sleeping bags (-5°C rating), and battery LED camping lantern.',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
          ]),
          sellerId: 'u_demo_rajesh',
          sellerName: 'Rajesh Kumar',
          sellerPhone: '+91 98401 23456',
          sellerEmail: 'rajesh.camera@example.com',
          sellerAddress: 'Gandhipuram, Coimbatore',
          pickupInstructions: 'All gear cleaned and sanitized. Easy 5-minute setup demonstration provided.',
          rating: 4.8,
          reviewCount: 19,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'p_demo_4',
          title: 'Epson Home Cinema 1080p FHD Projector & 100-inch Foldable Screen',
          price: 900,
          priceUnit: 'day',
          advanceDeposit: 3000,
          location: 'RS Puram, Coimbatore',
          distanceKm: 3,
          tag: 'Electronics',
          description: '3,300 lumens vivid color brightness projector with HDMI/FireStick support, built-in speaker, plus a freestanding 100-inch portable high-gain screen for movie nights & matches.',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
          ]),
          sellerId: 'u_demo_rajesh',
          sellerName: 'Rajesh Kumar',
          sellerPhone: '+91 98401 23456',
          sellerEmail: 'rajesh.camera@example.com',
          sellerAddress: 'RS Puram, Coimbatore',
          pickupInstructions: 'HDMI cables and power extensions included in rugged travel case.',
          rating: 5.0,
          reviewCount: 6,
          createdAt: new Date().toISOString(),
        },
      ];

      for (const p of defaultProducts) {
        await client.execute({
          sql: `INSERT INTO products (id, title, price, priceUnit, advanceDeposit, location, distanceKm, tag, description, images, sellerId, sellerName, sellerPhone, sellerEmail, sellerAddress, pickupInstructions, rating, reviewCount, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            p.id,
            p.title,
            p.price,
            p.priceUnit,
            p.advanceDeposit,
            p.location,
            p.distanceKm,
            p.tag,
            p.description,
            p.images,
            p.sellerId,
            p.sellerName,
            p.sellerPhone,
            p.sellerEmail,
            p.sellerAddress,
            p.pickupInstructions,
            p.rating,
            p.reviewCount,
            p.createdAt,
          ],
        });
      }
    }

    console.log('[SQLite Database] Tables initialized successfully');
  } catch (err) {
    console.error('[SQLite Init Error]', err);
  }
}

// Helpers for Products
export const sqliteProducts = {
  async getAll({ search, radius, sort, tag, sellerEmail, sellerId } = {}) {
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

    const res = await client.execute({ sql, args });
    return res.rows.map(deserializeProduct);
  },

  async getById(id) {
    const res = await client.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    });
    return res.rows.length ? deserializeProduct(res.rows[0]) : null;
  },

  async create(prod) {
    const id = prod.id || prod._id || `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const imagesJson = JSON.stringify(Array.isArray(prod.images) ? prod.images : []);

    await client.execute({
      sql: `INSERT INTO products (id, title, price, priceUnit, advanceDeposit, location, distanceKm, tag, description, images, sellerId, sellerName, sellerPhone, sellerEmail, sellerAddress, pickupInstructions, rating, reviewCount, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        prod.title?.trim() || '',
        Number(prod.price) || 0,
        prod.priceUnit || 'day',
        Number(prod.advanceDeposit) || 0,
        prod.location?.trim() || 'Coimbatore',
        Number(prod.distanceKm) || 3,
        prod.tag?.trim() || 'General',
        prod.description?.trim() || '',
        imagesJson,
        prod.sellerId || '',
        prod.sellerName?.trim() || 'Owner',
        prod.sellerPhone?.trim() || '',
        prod.sellerEmail?.toLowerCase().trim() || '',
        prod.sellerAddress?.trim() || '',
        prod.pickupInstructions?.trim() || 'Contact owner directly for handover.',
        Number(prod.rating) || 5.0,
        Number(prod.reviewCount) || 1,
        prod.createdAt || new Date().toISOString(),
      ],
    });

    return this.getById(id);
  },

  async delete(id) {
    await client.execute({
      sql: 'DELETE FROM products WHERE id = ?',
      args: [id],
    });
    return true;
  },
};

// Helpers for Users
export const sqliteUsers = {
  async findByEmail(email) {
    const res = await client.execute({
      sql: 'SELECT * FROM users WHERE LOWER(email) = ?',
      args: [email.toLowerCase().trim()],
    });
    return res.rows.length ? res.rows[0] : null;
  },

  async findById(id) {
    const res = await client.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id],
    });
    return res.rows.length ? res.rows[0] : null;
  },

  async create(user) {
    const id = user.id || user._id || `u_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await client.execute({
      sql: `INSERT INTO users (id, name, email, password, phone, location, avatar, bio, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        user.name?.trim(),
        user.email?.toLowerCase().trim(),
        user.password,
        user.phone?.trim() || '+91 98765 43210',
        user.location?.trim() || 'Anna Nagar, Chennai',
        user.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80`,
        user.bio || 'Rently member ready to rent and share gear.',
        new Date().toISOString(),
      ],
    });
    return this.findById(id);
  },

  async updatePassword(email, newPassword) {
    await client.execute({
      sql: 'UPDATE users SET password = ? WHERE LOWER(email) = ?',
      args: [newPassword, email.toLowerCase().trim()],
    });
    return true;
  },

  async updateProfile(id, updates) {
    const fields = [];
    const args = [];
    if (updates.name) {
      fields.push('name = ?');
      args.push(updates.name.trim());
    }
    if (updates.phone) {
      fields.push('phone = ?');
      args.push(updates.phone.trim());
    }
    if (updates.location) {
      fields.push('location = ?');
      args.push(updates.location.trim());
    }
    if (updates.bio) {
      fields.push('bio = ?');
      args.push(updates.bio.trim());
    }
    if (fields.length === 0) return this.findById(id);

    args.push(id);
    await client.execute({
      sql: `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      args,
    });
    return this.findById(id);
  },
};

// Helpers for Rentals
export const sqliteRentals = {
  async getAll({ userEmail, renterEmail, sellerEmail } = {}) {
    let sql = 'SELECT * FROM rentals WHERE 1=1';
    const args = [];
    if (userEmail) {
      const u = userEmail.toLowerCase().trim();
      sql += ' AND (LOWER(renterEmail) = ? OR LOWER(sellerEmail) = ?)';
      args.push(u, u);
    } else if (renterEmail) {
      sql += ' AND LOWER(renterEmail) = ?';
      args.push(renterEmail.toLowerCase().trim());
    } else if (sellerEmail) {
      sql += ' AND LOWER(sellerEmail) = ?';
      args.push(sellerEmail.toLowerCase().trim());
    }
    sql += ' ORDER BY createdAt DESC';

    const res = await client.execute({ sql, args });
    return res.rows.map(deserializeRental);
  },

  async getById(id) {
    const res = await client.execute({
      sql: 'SELECT * FROM rentals WHERE id = ?',
      args: [id],
    });
    return res.rows.length ? deserializeRental(res.rows[0]) : null;
  },

  async create(rental) {
    const id = rental.id || rental._id || `r_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const pickupPhotos = JSON.stringify(rental.pickupPhotos || []);
    const returnPhotos = JSON.stringify(rental.returnPhotos || []);
    const messages = JSON.stringify(rental.messages || []);

    await client.execute({
      sql: `INSERT INTO rentals (id, productId, productTitle, productImage, renterId, renterName, renterEmail, renterPhone, sellerId, sellerName, sellerEmail, sellerPhone, sellerAddress, startDate, days, totalPrice, advanceDeposit, depositRefunded, pickupOtp, pickupVerified, pickupPhotos, returnOtp, returnVerified, returnPhotos, status, messages, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        rental.productId,
        rental.productTitle,
        rental.productImage || '',
        rental.renterId || '',
        rental.renterName || 'Customer',
        rental.renterEmail?.toLowerCase().trim() || '',
        rental.renterPhone || '',
        rental.sellerId || '',
        rental.sellerName || 'Owner',
        rental.sellerEmail?.toLowerCase().trim() || '',
        rental.sellerPhone || '',
        rental.sellerAddress || '',
        rental.startDate,
        Number(rental.days) || 1,
        Number(rental.totalPrice) || 0,
        Number(rental.advanceDeposit) || 0,
        0,
        rental.pickupOtp,
        0,
        pickupPhotos,
        rental.returnOtp,
        0,
        returnPhotos,
        'Pickup Pending',
        messages,
        new Date().toISOString(),
      ],
    });

    return this.getById(id);
  },

  async update(id, updates) {
    const fields = [];
    const args = [];
    for (const [key, val] of Object.entries(updates)) {
      if (key === 'pickupPhotos' || key === 'returnPhotos' || key === 'messages') {
        fields.push(`${key} = ?`);
        args.push(JSON.stringify(val));
      } else if (key === 'pickupVerified' || key === 'returnVerified' || key === 'depositRefunded') {
        fields.push(`${key} = ?`);
        args.push(val ? 1 : 0);
      } else if (key !== 'id' && key !== '_id') {
        fields.push(`${key} = ?`);
        args.push(val);
      }
    }
    if (fields.length === 0) return this.getById(id);
    args.push(id);
    await client.execute({
      sql: `UPDATE rentals SET ${fields.join(', ')} WHERE id = ?`,
      args,
    });
    return this.getById(id);
  },
};

function deserializeProduct(row) {
  if (!row) return null;
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
}

function deserializeRental(row) {
  if (!row) return null;
  let pickupPhotos = [];
  let returnPhotos = [];
  let messages = [];
  try {
    pickupPhotos = typeof row.pickupPhotos === 'string' ? JSON.parse(row.pickupPhotos) : row.pickupPhotos || [];
  } catch {}
  try {
    returnPhotos = typeof row.returnPhotos === 'string' ? JSON.parse(row.returnPhotos) : row.returnPhotos || [];
  } catch {}
  try {
    messages = typeof row.messages === 'string' ? JSON.parse(row.messages) : row.messages || [];
  } catch {}

  return {
    ...row,
    _id: row.id,
    id: row.id,
    pickupVerified: Boolean(row.pickupVerified),
    returnVerified: Boolean(row.returnVerified),
    depositRefunded: Boolean(row.depositRefunded),
    pickupPhotos: Array.isArray(pickupPhotos) ? pickupPhotos : [],
    returnPhotos: Array.isArray(returnPhotos) ? returnPhotos : [],
    messages: Array.isArray(messages) ? messages : [],
  };
}
