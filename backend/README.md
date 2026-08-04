# Bloom & Bliss — Backend

Express.js + MongoDB (Mongoose) API for the Bloom & Bliss flower shop frontend.

## Features
- JWT authentication (register / login / session restore)
- Google Sign-In (OAuth ID token verification)
- Role-based authorization (`user` / `admin`)
- Full CRUD: Products, Orders, Gallery, Reviews, Wishlist, Delivery Settings, Promo Codes, Users
- Server-side price/stock recalculation on checkout (never trusts client totals)
- MongoDB Atlas cluster ready

## Quick Start
```bash
npm install
cp .env.example .env      # fill in MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID, CLIENT_URL
npm run seed               # loads demo products/gallery/promo codes + demo accounts
npm run dev                 # http://localhost:8080
```

See **API_DOCUMENTATION.md** for the full endpoint reference and frontend integration notes.

## Demo Accounts (after `npm run seed`)
| Role | Email | Password |
|---|---|---|
| User | amaya@email.lk | password123 |
| Admin | admin@bloomandbliss.lk | admin123 |
