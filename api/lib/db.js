import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'libsql://rental-gopika.aws-ap-south-1.turso.io';
const authToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMxMTEwMTcsImlkIjoiMDFhMTdkYmQtY2IwMS03ZjBjLThkNjEtYzNjYjBmMGJkYTc4Iiwia2lkIjoiM1hKNFMxSmo5MTZxRG5TMzhBM3ZMcmhlMkNyd1ZzNHZqNmI1UWJhN25xUSIsInJpZCI6IjA2MzlmMWE0LTAzZDgtNDA0Zi04NjRlLTNmOWRhNDVlNDIwYiJ9.0WMBWABbz9sciD38FQwBPvqRaWHBQUAAG6jG6SQRlBITdfv7SBehjECxrKVwDSWaBo2ON0hSWRJMePRTu-J-Dw';

export const client = createClient({
  url,
  authToken,
});

let tablesInitialized = false;

export async function ensureTables() {
  if (tablesInitialized) return;
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

    // Check if initial users exist
    const usersCountRes = await client.execute('SELECT COUNT(*) as count FROM users');
    if (Number(usersCountRes.rows[0]?.count || 0) === 0) {
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

    // Check if initial products exist
    const prodCountRes = await client.execute('SELECT COUNT(*) as count FROM products');
    if (Number(prodCountRes.rows[0]?.count || 0) === 0) {
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
          description: '33MP full-frame hybrid camera with 4K 60p 10-bit video, pristine Sony G Master 24-70mm f/2.8 lens, 2x 128GB V90 cards, 3 batteries, and dual charger.',
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

    tablesInitialized = true;
    console.log('[Turso Cloud SQLite] Tables initialized and verified successfully');
  } catch (err) {
    console.error('[Turso Cloud SQLite Init Error]', err);
  }
}
