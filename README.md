# 🎁 DD MYSTERY BOX - Production MERN Stack E-Commerce Platform

> **"Your Birthday. Your Theme. Your Surprise!"**

A full-stack, production-ready e-commerce web application designed for **DD MYSTERY BOX** — selling customizable birthday surprise mystery boxes filled with gift collectibles, chocolates, custom theme graphics, and memory keepsakes.

---

## 🌟 Key Features & Highlights

### 🛒 Customer Experience
- **Interactive Live Box Preview**: Watch recipient's name, birthday date, custom color glow, theme graphics, and personal message render in real time.
- **Curated Box Tiers**: Mini Birthday Box (₹299), Standard Birthday Box (₹499 - BEST SELLER), Premium Birthday Box (₹999).
- **11+ Themes**: Marvel, Anime, WWE, BGMI, Barbie, Hot Wheels, Shinchan, Gaming, Football, Cute, Luxury.
- **Lucky Reward Wheel**: Post-checkout interactive spin/reveal module with celebratory confetti, awarding discount vouchers, free keychains, or cashbacks!
- **Order Tracking**: Visual step-by-step timeline (Order Placed -> Confirmed -> Preparing -> Packed -> Shipped -> Out for Delivery -> Delivered).
- **Comprehensive Account Suite (23 Views)**: Home, Shop, Product Details, Customize, Cart, Checkout, Razorpay Payment, Order Success, Track Order, Profile, My Orders, Saved Addresses, Wishlist, Reviews, FAQ, Contact Us, Privacy Policy, Terms & Conditions, Refund Policy.

### 🛡️ Admin Dashboard (`/admin`)
- **Real-Time Analytics**: Total Revenue, Today's Revenue, Total Orders, Today's Orders, Pending Orders, Delivered Orders, Total Customers, Avg Order Value.
- **Order Management**: Inspect custom blueprints, update workshop packing status, attach shipping tracking numbers.
- **Products & Themes CRUD**: Add/edit mystery box tiers and active birthday themes.
- **Inventory Management**: Track chocolates, keychains, stickers, toys, greeting cards, and packaging stock with low-stock alerts.
- **Coupons & Moderation**: Create promo codes (`FIRSTORDER10`, `BIRTHDAY20`, `WELCOME50`), moderate reviews, and configure lucky reward odds.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, React Router DOM v6, Tailwind CSS, Axios, Lucide React Icons, Canvas-Confetti.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose ORM, JWT Authentication, bcryptjs, Helmet, CORS, Morgan.
- **Integrations**: Razorpay (with safe Test/Mock Mode fallback for development), Cloudinary, Notification Architecture.

---

## 📁 Directory Structure

```
dd mystery box/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI (Navbar, Footer, LiveBoxPreview, LuckyRewardWheel, OrderTimeline, ProductCard, AdminSidebar, etc.)
│   │   ├── context/        # AuthContext, CartContext, WishlistContext, ToastContext
│   │   ├── pages/          # All 23 customer pages & admin dashboard views
│   │   ├── services/       # Axios API client instance
│   │   ├── App.jsx         # Routes definition
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   └── vite.config.js
├── server/                 # Node.js + Express Backend
│   ├── config/             # DB, Razorpay, Cloudinary configurations
│   ├── controllers/        # Express request handlers
│   ├── middleware/         # JWT Auth, Admin Check, Error Handling
│   ├── models/             # Mongoose schemas (User, Product, Theme, Order, Cart, Inventory, Coupon, Review, Wishlist, Reward)
│   ├── routes/             # REST API endpoints
│   ├── utils/              # Token, OrderID Generator, Notification Service
│   ├── seed.js             # Automated Database Seeder
│   └── server.js           # Server Entrypoint
└── README.md
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance running at `mongodb://127.0.0.1:27017` or MongoDB Atlas URI.

### 2. Environment Setup

Copy `.env.example` to `.env` in the `/server` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/dd_mystery_box
JWT_SECRET=dd_mystery_box_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# Razorpay Credentials (Mock Mode auto-activates if test keys are used)
RAZORPAY_KEY_ID=rzp_test_ddmysterybox123
RAZORPAY_KEY_SECRET=rzp_test_secretkey12345

# Admin Seed Account Credentials
ADMIN_NAME=DD Mystery Admin
ADMIN_EMAIL=admin@ddmysterybox.com
ADMIN_PASSWORD=Admin@123456
```

### 3. Backend Setup & Seeding

```bash
cd server
npm install

# Seed Initial Products, Themes, Inventory, Coupons, and Admin User
npm run seed

# Start Backend Express Server
npm run dev
```

### 4. Frontend Setup

```bash
cd ../client
npm install

# Start Vite Development Server
npm run dev
```

The application will be accessible at: `http://localhost:5173`.

---

## 🔑 Demo Credentials

- **Admin Dashboard**: `http://localhost:5173/admin`

---

## 🔒 Security Practices

- **Password Security**: Passwords are hashed using bcrypt with salt rounds.
- **JWT Protection**: Protected routes require valid Bearer token verification.
- **Payment Signature Verification**: Backend verifies Razorpay HMAC SHA-256 signatures before confirming orders.
- **Role Isolation**: Customers cannot access `/admin` API routes or dashboard interfaces.
