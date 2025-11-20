const express = require('express');
const router = express.Router();
const { createOrder, getOrders } = require('../controllers/ordersController');

// GET /api/orders
router.get('/', getOrders);

// POST /api/orders
router.post('/', createOrder);

module.exports = router;
