const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { sendOrderEmail } = require("../config/mailer");

/**
 * @route   POST /api/orders
 * @desc    Create new order (Customer)
 * @access  Public
 */
router.post("/", async (req, res) => {
  try {
    const { fullName, phoneNumber, notes, items } = req.body;

    if (!fullName || !phoneNumber || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const customerName = String(fullName).trim();
    const customerPhone = String(phoneNumber).trim();
    const orderNotes = notes ? String(notes).trim() : "None";

    // 1) Create order first (total=0 placeholder)
    const [orderResult] = await db.query(
      `
      INSERT INTO orders (customer_name, customer_phone, notes, status, total)
      VALUES (?, ?, ?, 'pending', 0)
      `,
      [customerName, customerPhone, orderNotes]
    );

    const orderId = orderResult.insertId;

    // 2) Insert order items + compute total
    let total = 0;
    const cleanItems = [];

    for (const it of items) {
      const itemName = String(it.item_name || "").trim();
      const qty = Number(it.qty);
      const price = Number(it.price);

      if (!itemName || qty <= 0 || Number.isNaN(price) || price < 0) continue;

      await db.query(
        `
        INSERT INTO order_items (order_id, item_name, quantity, price)
        VALUES (?, ?, ?, ?)
        `,
        [orderId, itemName, qty, price]
      );

      total += qty * price;

      cleanItems.push({ item_name: itemName, qty, price });
    }

    // 3) Update total in orders table
    await db.query(`UPDATE orders SET total = ? WHERE id = ?`, [total, orderId]);

    // ✅ Respond to frontend
    res.status(201).json({ message: "Order created successfully", orderId });

    // 4) Send email (does NOT break order creation)
    try {
      await sendOrderEmail({
        fullName: customerName,
        phoneNumber: customerPhone,
        notes: orderNotes,
        orderId,
        date: new Date().toISOString(),
        items: cleanItems,
        total,
      });

      console.log("✅ Order email sent successfully for order:", orderId);
    } catch (emailErr) {
      console.error("❌ Order email FAILED:", emailErr?.message || emailErr);
    }
  } catch (err) {
    console.error("❌ Create order error:", err.message);
    res.status(500).json({ message: "Failed to create order" });
  }
});

/**
 * @route   GET /api/orders/admin
 * @desc    Get all orders for Admin
 * @access  Admin
 *
 * ✅ FIXED: no v_orders, no items_json. Loads from orders + order_items.
 */
router.get("/admin", async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT id, customer_name, customer_phone, status, created_at, total, notes
      FROM orders
      ORDER BY created_at DESC
    `);

    // attach items for each order
    for (const o of orders) {
      const [items] = await db.query(
        `
        SELECT item_name, quantity AS qty, price
        FROM order_items
        WHERE order_id = ?
        `,
        [o.id]
      );
      o.items = items;
    }

    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Fetch orders error:", err.message);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/**
 * @route   PATCH /api/orders/admin/:id
 * @desc    Update order status (Admin)  ✅ needed by Admin.jsx
 * @access  Admin
 */
router.patch("/admin/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const newStatus = String(status || "").trim();
    if (!newStatus) return res.status(400).json({ message: "Status is required" });

    const [order] = await db.query("SELECT id FROM orders WHERE id = ?", [orderId]);
    if (!order.length) return res.status(404).json({ message: "Order not found" });

    await db.query("UPDATE orders SET status = ? WHERE id = ?", [newStatus, orderId]);

    res.status(200).json({ message: "Order updated", id: Number(orderId), status: newStatus });
  } catch (err) {
    console.error("❌ Update order error:", err.message);
    res.status(500).json({ message: "Failed to update order" });
  }
});

/**
 * @route   DELETE /api/orders/admin/:id
 * @desc    Delete order by ID (Admin)
 * @access  Admin
 */
router.delete("/admin/:id", async (req, res) => {
  try {
    const orderId = req.params.id;

    const [order] = await db.query("SELECT id FROM orders WHERE id = ?", [orderId]);
    if (!order.length) return res.status(404).json({ message: "Order not found" });

    await db.query("DELETE FROM order_items WHERE order_id = ?", [orderId]);
    await db.query("DELETE FROM orders WHERE id = ?", [orderId]);

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("❌ Delete order error:", err.message);
    res.status(500).json({ message: "Failed to delete order" });
  }
});

module.exports = router;
