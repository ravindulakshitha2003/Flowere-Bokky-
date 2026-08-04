# Bloom & Bliss — Backend API Documentation

Express.js + MongoDB (Mongoose) REST API built to power the **Bloom & Bliss** React frontend.

Base URL (local): `http://localhost:8080`
All endpoints are prefixed with `/api`.

---

## 1. Setup

```bash
cd backend
npm install
cp .env.example .env    # then fill in your real values
npm run seed             # loads demo products/gallery/promo codes + demo accounts
npm run dev               # starts on http://localhost:8080 (nodemon)
```

### Required `.env` values

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `8080`) |
| `MONGODB_URI` | Your MongoDB **Atlas cluster** connection string |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Web Client ID from Google Cloud Console (for "Sign in with Google") |
| `CLIENT_URL` | Frontend origin(s) for CORS, comma-separated if multiple |

### Connecting the frontend

In the frontend project root, create `.env`:

```
VITE_API_URL=http://localhost:8080
```

`AuthContext.jsx` already reads `import.meta.env.VITE_API_URL` and calls `/api/auth/login`, `/api/auth/register`, `/api/auth/me` — so login/register/session-restore will work immediately once the backend is running. Other pages (Shop, Gallery, Checkout, Admin panels) currently read from local mock data / localStorage and will need their `fetch` calls pointed at the endpoints below (see section 8).

### Demo accounts (created by `npm run seed`)

| Role | Email | Password |
|---|---|---|
| User | amaya@email.lk | password123 |
| Admin | admin@bloomandbliss.lk | admin123 |

---

## 2. Authentication

All protected routes expect:

```
Authorization: Bearer <JWT token>
```

The token is returned from login/register/google-auth and should be stored client-side (the frontend already stores it as `bb_token` in `localStorage`).

### `POST /api/auth/register`
Public.

**Body**
```json
{ "name": "Amaya", "email": "amaya@email.lk", "phone": "0771234567", "password": "password123" }
```
**201 Response**
```json
{ "token": "eyJhbGciOi...", "user": { "id": "...", "name": "Amaya", "email": "amaya@email.lk", "role": "user", "phone": "0771234567" } }
```

### `POST /api/auth/login`
Public.
**Body:** `{ "email": "...", "password": "..." }`
**200 Response:** same shape as register.

### `POST /api/auth/google`
Public. Used with **Google Identity Services** ("Sign in with Google" button) on the frontend. The frontend obtains a `credential` (Google ID token) from Google's client library and sends it here — the backend verifies it server-side and issues its own JWT.

**Body**
```json
{ "credential": "<Google ID token from Google Identity Services>" }
```
**200 Response:** same shape as login (creates the user automatically on first sign-in).

Frontend integration snippet:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```
```js
google.accounts.id.initialize({
  client_id: "YOUR_GOOGLE_CLIENT_ID",
  callback: async (response) => {
    const res = await fetch(`${API_BASE}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential }),
    });
    const data = await res.json();
    // store data.token / data.user exactly like the existing login() flow
  },
});
```

### `GET /api/auth/me` — Private
Returns the logged-in user's profile. Used by `AuthContext.jsx` to restore sessions.

### `PUT /api/auth/me` — Private
**Body (any subset):** `{ "name": "...", "phone": "...", "address": "...", "avatar": "..." }`

### `PUT /api/auth/change-password` — Private
**Body:** `{ "currentPassword": "...", "newPassword": "..." }`

---

## 3. Products

### `GET /api/products` — Public
Query params (all optional):

| Param | Example | Notes |
|---|---|---|
| `type` | `Natural Flowers` \| `Hand-Ribbon` | |
| `occasion` | `Birthday` | matches `occasions` array |
| `color` | `Pink` | matches `colors` array |
| `minPrice` / `maxPrice` | `1000` / `10000` | filters against S/M/L prices |
| `isOffer` | `true` | |
| `search` | `rose` | full-text search on name/description |
| `sort` | `price-asc` \| `price-desc` \| `rating` \| `newest` | |
| `page` / `limit` | `1` / `20` | pagination |

**200 Response**
```json
{
  "products": [ { "id": "...", "name": "Colombo Rose Garden", "sizes": { "S": {...}, "M": {...}, "L": {...} }, "...": "..." } ],
  "page": 1,
  "totalPages": 1,
  "totalResults": 6
}
```

### `GET /api/products/:id` — Public
Returns a single product.

### `POST /api/products` — Private/Admin
Body = full product object (see `Product` shape in `data/products.js` — the schema mirrors it: `name, type, description, colors, sizes{S,M,L:{flowers,price,stock}}, occasions, quality, weight, packingMaterial, packingCost, wrappingOptions, isOffer, offerDiscount, images, flowers, dimensions{height,width}, faq[{q,a}]`).

### `PUT /api/products/:id` — Private/Admin
Partial or full update.

### `DELETE /api/products/:id` — Private/Admin

### `PATCH /api/products/:id/stock` — Private/Admin
**Body:** `{ "size": "M", "stock": 12 }`

---

## 4. Orders

### `POST /api/orders` — Private (checkout)
**Body**
```json
{
  "items": [
    {
      "product": "<productId>",
      "name": "Colombo Rose Garden",
      "size": "M",
      "quantity": 1,
      "price": 7800,
      "packingCost": 350,
      "wrapping": "Blush Pink",
      "addons": [{ "name": "Greeting Card", "price": 200 }]
    }
  ],
  "customer": { "name": "Amaya", "email": "amaya@email.lk", "phone": "0771234567", "address": "12 Galle Rd, Colombo 3" },
  "deliverySlot": "morning",
  "deliveryDate": "2026-06-15",
  "giftWrapping": true,
  "paymentMethod": "cod",
  "shippingCost": 300
}
```
The server recalculates `subtotal`/`total` itself (never trusts client-sent totals) and **decrements product stock**. Returns the created order, including a generated human-readable `orderId` like `ORD-4821`.

### `GET /api/orders` — Private
Returns the logged-in user's own orders. Admins can pass `?all=true` to get every order in the system.

### `GET /api/orders/:orderId` — Public
Looks up by the human-readable `orderId` (e.g. `ORD-2847`) — powers the public `/track/:orderId` page, no login required.

### `PATCH /api/orders/:orderId/status` — Private/Admin
**Body:** `{ "status": "in-progress", "note": "Being hand-crafted", "timestamp": "2026-06-15T10:00:00Z" }`
Valid `status` values: `pending`, `in-progress`, `ready`, `out-for-delivery`, `delivered`, `cancelled`.

---

## 5. Gallery

### `GET /api/gallery` — Public
Query params: `tab` (`work`|`brand`), `occasion`, `type`, `includeUnapproved`.

### `GET /api/gallery/:id` — Public

### `POST /api/gallery` — Private
Any logged-in user can submit a photo (created as `isApproved: false`, pending admin review). Admins' submissions are auto-approved.

### `PUT /api/gallery/:id` — Private/Admin
Used for approving submissions (`{ "isApproved": true }`), featuring items, editing details.

### `DELETE /api/gallery/:id` — Private/Admin

---

## 6. Reviews

### `GET /api/reviews?product=:productId` — Public

### `POST /api/reviews` — Private
**Body:** `{ "product": "<productId>", "rating": 5, "text": "Absolutely stunning!" }`
Automatically recalculates the parent product's `rating` and `reviewCount`.

### `PUT /api/reviews/:id` — Private (owner or admin)
### `DELETE /api/reviews/:id` — Private (owner or admin)

---

## 7. Wishlist

All routes are Private and scoped to the logged-in user.

- `GET /api/wishlist` — returns populated array of product documents
- `POST /api/wishlist/:productId` — add
- `DELETE /api/wishlist/:productId` — remove

---

## 8. Delivery Settings (zones / slots / rules)

Single settings document powering the delivery-zone pricing, time slots, and checkout rules used on `CheckoutPage.jsx`.

### `GET /api/delivery-settings` — Public
```json
{
  "zones": [{ "_id": "...", "name": "Zone 1", "minKm": 0, "maxKm": 5, "priceSmall": 150, "priceMedium": 200, "priceLarge": 300, "active": true }],
  "slots": [{ "_id": "...", "label": "Morning", "time": "08:00 AM – 12:00 PM", "icon": "🌅", "active": true, "maxOrders": 20 }],
  "rules": { "sameDayDelivery": true, "freeDeliveryThreshold": 5000, "blockSundays": true, "advanceBookingDays": 1 }
}
```

### `PUT /api/delivery-settings` — Private/Admin
**Body:** any subset of `{ "zones": [...], "slots": [...], "rules": {...} }` — replaces the given arrays / merges rules.

---

## 9. Promo Codes

### `POST /api/promo-codes/validate` — Public
**Body:** `{ "code": "BLOOM15" }`
**200:** `{ "code": "BLOOM15", "discount": 15, "type": "percent" }`
**404** if invalid/inactive.

### `GET /api/promo-codes` — Private/Admin — list all
### `POST /api/promo-codes` — Private/Admin — `{ "code": "SUMMER20", "discount": 20, "type": "percent" }`
### `PUT /api/promo-codes/:id` — Private/Admin
### `DELETE /api/promo-codes/:id` — Private/Admin

---

## 10. User Management (Admin)

- `GET /api/users` — list all users
- `GET /api/users/:id` — single user
- `PUT /api/users/:id` — `{ "role": "admin", "isActive": false, ... }`
- `DELETE /api/users/:id`

---

## 11. Error Format

All errors return:
```json
{ "success": false, "message": "Human-readable error message" }
```
Common status codes: `400` validation, `401` missing/invalid token, `403` forbidden (wrong role), `404` not found, `409` conflict (duplicate email / insufficient stock).

---

## 12. Authorization Rules Summary

| Resource | Public | Logged-in user | Admin only |
|---|---|---|---|
| Products (read) | ✅ | ✅ | ✅ |
| Products (write) | | | ✅ |
| Orders (create) | | ✅ | ✅ |
| Orders (own list) | | ✅ | ✅ |
| Orders (all / status update) | | | ✅ |
| Order tracking by orderId | ✅ | ✅ | ✅ |
| Gallery (read) | ✅ | ✅ | ✅ |
| Gallery (submit) | | ✅ (unapproved) | ✅ (approved) |
| Gallery (approve/edit/delete) | | | ✅ |
| Reviews (read) | ✅ | ✅ | ✅ |
| Reviews (write own) | | ✅ | ✅ |
| Wishlist | | ✅ | ✅ |
| Delivery settings (read) | ✅ | ✅ | ✅ |
| Delivery settings (write) | | | ✅ |
| Promo validate | ✅ | ✅ | ✅ |
| Promo CRUD | | | ✅ |
| Users management | | | ✅ |

---

## 13. Project Structure

```
backend/
├── server.js                  # entry point
├── .env.example
├── src/
│   ├── app.js                 # express app, routes mounted here
│   ├── config/db.js           # mongoose connection
│   ├── models/                # User, Product, Order, Gallery, Review, Wishlist, DeliverySettings, PromoCode
│   ├── middleware/
│   │   ├── auth.js            # protect() + authorize('admin')
│   │   └── errorHandler.js
│   ├── controllers/
│   ├── routes/
│   └── utils/
│       ├── generateToken.js
│       ├── seed.js            # loads demo data + accounts
│       └── seedData/          # products.json, gallery.json (extracted from the frontend)
```

## 14. Notes on scope

This backend intentionally stays close to what the frontend actually needs — standard JWT auth, role-based authorization (`user`/`admin`), Google Sign-In, and CRUD for every entity the frontend already models (products, orders, gallery, reviews, wishlist, delivery settings, promo codes, users). No extra infrastructure (queues, caching layers, microservices, etc.) was added, per the request to keep it lean and functional.
