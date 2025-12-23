const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getAllOrdersAdmin,
  deleteOrderAdmin,
} = require("../controllers/ordersController");

/* =========================
   CUSTOMER ROUTES
   Base: /api/orders
========================= */

// GET /api/orders?phone=XXXX  -> previous orders for a customer
router.get("/", getOrders);

// POST /api/orders -> create new order
router.post("/", createOrder);

/* =========================
   ADMIN ROUTES
   Base: /api/orders/admin
========================= */

// GET /api/orders/admin -> all orders with items
router.get("/admin", getAllOrdersAdmin);

// DELETE /api/orders/admin/:id -> delete order (items auto-delete via CASCADE)
router.delete("/admin/:id", deleteOrderAdmin);

module.exports = router;
