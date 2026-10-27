import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_USERS = [
  {
    _id: 'u_demo_alex',
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    password: 'password123',
    phone: '+91 98765 43210',
    location: 'Anna Nagar, Chennai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Avid photographer & tech enthusiast. Love sharing gear and borrowing outdoor equipment!',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'u_demo_rajesh',
    name: 'Rajesh Kumar',
    email: 'rajesh.camera@example.com',
    password: 'password123',
    phone: '+91 98401 23456',
    location: 'Perur, Coimbatore',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Professional filmmaker & drone pilot renting high-end production equipment.',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_PRODUCTS = [
  {
    _id: 'p_demo_1',
    id: 'p_demo_1',
    title: 'Sony Alpha A7 IV Mirrorless Camera + 24-70mm GM Lens',
    price: 1500,
    priceUnit: 'day',
    advanceDeposit: 5000,
    location: 'Perur, Coimbatore',
    distanceKm: 2,
    tag: 'Photography',
    description: '33MP full-frame hybrid camera with 4K 60p 10-bit video, pristine Sony G Master 24-70mm f/2.8 lens, 2x 128GB V90 cards, 3 batteries, and dual charger. Perfect for weddings and shoots.',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
    ],
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
    _id: 'p_demo_2',
    id: 'p_demo_2',
    title: 'DJI Mini 3 Pro Drone Combo + RC Smart Controller',
    price: 1800,
    priceUnit: 'day',
    advanceDeposit: 6000,
    location: 'Anna Nagar, Chennai',
    distanceKm: 5,
    tag: 'Drones',
    description: 'Sub-249g lightweight 4K HDR drone with tri-directional obstacle sensing, true vertical shooting, 3 intelligent flight batteries (34 mins each), ND filter kit, and shoulder bag.',
    images: [
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80',
    ],
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
    _id: 'p_demo_3',
    id: 'p_demo_3',
    title: 'Quechua 4-Person Waterproof Camping Tent & Dual Sleeping Bags',
    price: 450,
    priceUnit: 'day',
    advanceDeposit: 1500,
    location: 'Gandhipuram, Coimbatore',
    distanceKm: 4,
    tag: 'Camping & Outdoors',
    description: 'FreshDecath waterproof 4-person dome tent with blackout technology, 2 self-inflating camp mattresses, 2 compact thermal sleeping bags (-5°C rating), and battery LED camping lantern.',
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
    ],
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
    _id: 'p_demo_4',
    id: 'p_demo_4',
    title: 'Epson Home Cinema 1080p FHD Projector & 100-inch Foldable Screen',
    price: 900,
    priceUnit: 'day',
    advanceDeposit: 3000,
    location: 'RS Puram, Coimbatore',
    distanceKm: 3,
    tag: 'Electronics',
    description: '3,300 lumens vivid color brightness projector with HDMI/FireStick support, built-in speaker, plus a freestanding 100-inch portable high-gain screen for movie nights & matches.',
    images: [
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    ],
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

const DEFAULT_RENTALS = [
  {
    _id: 'r_demo_sample',
    productId: 'p_demo_1',
    productTitle: 'Sony Alpha A7 IV Mirrorless Camera + 24-70mm GM Lens',
    productImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    renterId: 'u_demo_alex',
    renterName: 'Alex Morgan',
    renterEmail: 'alex.morgan@example.com',
    renterPhone: '+91 98765 43210',
    sellerId: 'u_demo_rajesh',
    sellerName: 'Rajesh Kumar',
    sellerEmail: 'rajesh.camera@example.com',
    sellerPhone: '+91 98401 23456',
    sellerAddress: 'Perur, Coimbatore',
    startDate: new Date().toISOString().split('T')[0],
    days: 2,
    totalPrice: 3000,
    advanceDeposit: 5000,
    depositRefunded: false,
    pickupOtp: '849201',
    pickupVerified: true,
    pickupPhotos: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    ],
    pickupTimestamp: new Date().toISOString(),
    returnOtp: '391042',
    returnVerified: false,
    returnPhotos: [],
    status: 'Active',
    messages: [
      {
        sender: 'System / Rently Platform',
        senderEmail: 'system@rently.com',
        text: 'Rental confirmed. Pickup OTP verified. Private chat active between Owner & Renter.',
        isProof: false,
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

function getFilePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function getDefaultData(collection) {
  if (collection === 'users') return DEFAULT_USERS;
  if (collection === 'products') return DEFAULT_PRODUCTS;
  if (collection === 'rentals') return DEFAULT_RENTALS;
  return [];
}

export const localDb = {
  // Read all items from a collection
  read(collection) {
    const filePath = getFilePath(collection);
    try {
      if (!fs.existsSync(filePath)) {
        const defaults = getDefaultData(collection);
        this.write(collection, defaults);
        return defaults;
      }
      const raw = fs.readFileSync(filePath, 'utf-8');
      if (!raw || !raw.trim()) {
        const defaults = getDefaultData(collection);
        this.write(collection, defaults);
        return defaults;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn(`[LocalDB Read Error: ${collection}]`, err.message);
      return getDefaultData(collection);
    }
  },

  // Write full list to a collection atomically
  write(collection, items) {
    const filePath = getFilePath(collection);
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    try {
      const dataStr = JSON.stringify(items, null, 2);
      fs.writeFileSync(tempPath, dataStr, 'utf-8');
      fs.renameSync(tempPath, filePath);
      return true;
    } catch (err) {
      console.error(`[LocalDB Write Error: ${collection}]`, err.message);
      // Fallback direct write
      try {
        fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
        return true;
      } catch (inner) {
        console.error(`[LocalDB Direct Write Error]`, inner.message);
        return false;
      }
    }
  },

  // Insert a new record
  insert(collection, item) {
    const list = this.read(collection);
    const prefix = collection === 'users' ? 'u_' : collection === 'products' ? 'p_' : 'r_';
    const id = item._id || item.id || `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const record = {
      ...item,
      _id: id,
      id: id,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.unshift(record);
    this.write(collection, list);
    return record;
  },

  // Find by ID
  findById(collection, id) {
    const list = this.read(collection);
    return list.find((it) => String(it._id || it.id) === String(id)) || null;
  },

  // Find one matching query filter
  findOne(collection, filterFn) {
    const list = this.read(collection);
    return list.find(filterFn) || null;
  },

  // Find all matching query filter
  find(collection, filterFn) {
    const list = this.read(collection);
    if (!filterFn) return list;
    return list.filter(filterFn);
  },

  // Update a record
  update(collection, id, updates) {
    const list = this.read(collection);
    const idx = list.findIndex((it) => String(it._id || it.id) === String(id));
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      ...updates,
      _id: list[idx]._id || list[idx].id,
      id: list[idx].id || list[idx]._id,
      updatedAt: new Date().toISOString(),
    };

    this.write(collection, list);
    return list[idx];
  },

  // Delete a record
  delete(collection, id) {
    const list = this.read(collection);
    const initialLen = list.length;
    const filtered = list.filter((it) => String(it._id || it.id) !== String(id));
    if (filtered.length !== initialLen) {
      this.write(collection, filtered);
      return true;
    }
    return false;
  },
};
