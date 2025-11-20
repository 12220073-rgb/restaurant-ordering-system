# Backend (Node + Express) for Mostafa Restaurant

## 1) Requirements
- Node.js (v16+)
- MySQL / MariaDB with the `restaurant_db` imported (you already have it). See restaurant_db.sql used: it contains tables categories, menu_items, orders, order_items.

## 2) Setup
1. Put this folder as `backend/` next to your frontend folder.
2. Copy `.env.example` to `.env` and set DB credentials.

## 3) Install & Run
$ cd backend
$ npm install
$ npm run dev   # requires nodemon (dev) or npm start

## 4) API Endpoints
- GET /api/items
  returns list of menu items:
  [{ item_id, item_name, price, category }, ...]

- POST /api/orders
  body: {
    customer_name: "...",
    customer_phone: "...",
    customer_address: "...",
    total: 12.50,
    items: [{ id: <menu_items.id>, quantity: <number>, subtotal: <number> }, ...]
  }

- GET /api/orders
  optionally: /api/orders?phone=+961XXXXXXXX
  returns orders grouped with their items.

## 5) Notes
- This backend is built to match your imported `restaurant_db` structure. (categories, menu_items, orders, order_items).
- If you used different column/table names, edit controllers accordingly.
