# Rently — Peer-to-Peer Equipment Sharing Platform

**Rently** is a modern, full-featured peer-to-peer equipment sharing marketplace that connects people who need gear (cameras, tools, camping equipment, electronics) with neighbors who own it.

---

## 🌟 Key Features

1. **Rapido-Style Dual OTP Security Handshakes:**
   - **Pickup:** Customer generates a 6-digit secret OTP on their phone. The owner verifies this OTP in Rently before handing over gear.
   - **Return:** Owner generates a 6-digit Return OTP. The customer verifies this OTP in Rently upon returning the item and collecting their deposit refund.
2. **Owner-Only Pickup Condition Proof:**
   - Pre-rental condition photos uploaded *exclusively* by the owner during pickup.
   - Zero image upload required at return.
3. **Strict 2-Party Private Rental Chat:**
   - Direct encrypted communication stream restricted exclusively to the owner and customer of that booking.
   - Interactive baseline damage inspection gallery with click-to-zoom full-screen preview.
4. **Intermediary Platform Model & Zero Website Escrow:**
   - Rental charges & refundable surety deposits are paid directly between user and owner (Cash / UPI).
   - One-time sign-up intermediary terms & conditions acknowledgment.
5. **Dynamic Geolocation & Haversine Distance Calculation:**
   - Real-time distance calculation between borrower and lender across South Indian cities & postal codes.

---

## 📁 Repository Structure

```
Rent/
├── RentalHubDashboard.jsx     # Main React Dashboard, Modals, Feed & State Engine
├── index.html                 # HTML Entry Point
├── package.json               # Frontend dependencies & scripts
├── vite.config.js             # Vite Build Configuration
├── vercel.json                # Vercel SPA Routing Configuration
├── .env.example               # Environment Variables Template
├── .gitignore                 # Git Ignore Configuration
├── src/
│   ├── App.jsx                # Application Root Component
│   ├── main.jsx               # React DOM Rendering
│   └── index.css              # Custom Theme & Styling (Tailwind / CSS)
└── server/                    # Express + MongoDB Backend API
    ├── config/db.js           # Database Connection
    ├── models/                # User, Product, Rental Schemas
    ├── routes/                # Auth, Product, Rental API Routes
    ├── seed.js                # Database Seeder (5 Sample Products)
    ├── server.js              # Express API Server
    └── package.json           # Backend dependencies
```

---

## 🚀 Local Development Setup

### One-Command Setup (Frontend + Persistent Database Server)
```bash
# Install dependencies (first time only)
npm install

# Start both Vite Frontend (port 3000) and Backend Database Server (port 5000)
npm run dev
```

- **Frontend:** `http://localhost:3000`
- **Backend API & Database:** `http://localhost:5000/api`

---

## 🗄️ Database Architecture & Multi-Account Sharing

Rently includes a hybrid database architecture:
1. **Persistent Zero-Config Database (`server/data/`):**
   - Stores all **Products**, **Users**, and **Rentals** on disk in JSON database format.
   - Requires zero external installations; any item uploaded by Account A is immediately saved to the database and visible in real-time to Account B across all browsers, incognito sessions, and devices.
   - Includes real-time 4-second polling and window focus auto-synchronization.
2. **MongoDB / MongoDB Atlas Support (Optional):**
   - To connect to MongoDB or MongoDB Atlas in production, simply provide your connection string in `server/.env`:
     ```env
     MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/rentalhub
     ```
   - When detected, Rently automatically uses Mongoose models; otherwise, it seamlessly uses the persistent local database engine without any downtime or crashes.

---

## ☁️ Deploying to Vercel

### Step 1: Initialize Git & Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Rently marketplace with OTP handshake & private chat"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Step 2: Import to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Import your GitHub repository.
4. Framework Preset: **Vite**
5. Root Directory: `./` (leave default)
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. *(Optional)* Under **Environment Variables**, add:
   - `VITE_API_BASE`: `https://<your-backend-domain>/api` (or leave empty to run standalone with local storage fallback).
9. Click **"Deploy"**.

---

## 🛡️ License & Support
For queries or support, reach out to **rently2007@gmail.com**.
© 2026 Rently. Peer-to-Peer Sharing.
