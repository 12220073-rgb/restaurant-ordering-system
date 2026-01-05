// backend/controllers/ordersController.js
const pool = require("../config/db");
const { sendOrderEmail } = require("../config/mailer");

/**
 * GET all orders (optionally filter by phone)
 */
async function getOrders(req, res) {
  const phone = req.query.phone || null;

  try {
    let query = `
      SELECT 
        o.id AS order_id,
        o.customer_name,
        o.customer_phone,
        o.customer_notes,
        o.total,
        o.created_at,
        oi.order_item_id,
        oi.item_name,
        oi.quantity AS qty,
        oi.price
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;

    const params = [];
    if (phone) {
      query += " WHERE o.customer_phone = ?";
      params.push(phone);
    }

    query += " ORDER BY o.created_at DESC, oi.order_item_id ASC";

    const [rows] = await pool.query(query, params);

    // Group items by order
    const ordersMap = {};
    rows.forEach((r) => {
      if (!ordersMap[r.order_id]) {
        ordersMap[r.order_id] = {
          orderId: r.order_id,
          fullName: r.customer_name || "N/A",
          phoneNumber: r.customer_phone || "N/A",
          notes: r.customer_notes || "None",
          total: parseFloat(r.total) || 0,
          created_at: r.created_at,
          items: [],
        };
      }

      if (r.order_item_id) {
        ordersMap[r.order_id].items.push({
          order_item_id: r.order_item_id,
          item_name: r.item_name || "Unnamed",
          qty: r.qty || 0,
          price: parseFloat(r.price) || 0,
        });
      }
    });

    res.json(Object.values(ordersMap));
  } catch (err) {
    console.error("❌ Failed to fetch orders:", err.message);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
}

/**
 * POST create a new order
 */
async function createOrder(req, res) {
  const { fullName, phoneNumber, notes = "None", items } = req.body;

  if (!fullName || !phoneNumber) {
    return res.status(400).json({ message: "Name and phone are required" });
  }

  if (!items || !items.length) {
    return res.status(400).json({ message: "Order must contain items" });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Insert order with placeholder total
    const [order] = await conn.query(
      "INSERT INTO orders (customer_name, customer_phone, customer_notes, total) VALUES (?, ?, ?, 0)",
      [fullName, phoneNumber, notes]
    );

    let total = 0;

    // Insert items using item_name and price
    for (const it of items) {
      const qty = parseInt(it.qty, 10) || 0;
      const price = parseFloat(it.price) || 0;

      await conn.query(
        "INSERT INTO order_items (order_id, quantity, item_name, price) VALUES (?, ?, ?, ?)",
        [order.insertId, qty, it.item_name, price]
      );

      total += qty * price;
    }

    // Update total in orders table
    await conn.query("UPDATE orders SET total = ? WHERE id = ?", [
      total,
      order.insertId,
    ]);

    await conn.commit();

    // ✅ Send email with proper await + strong logging
    try {
      await sendOrderEmail({
        fullName,
        phoneNumber,
        notes,
        orderId: order.insertId,
        date: new Date().toISOString(), // ✅ same style as your test
        items,
        total,
      });

      console.log("✅ Order email sent successfully for order:", order.insertId);
    } catch (emailErr) {
      console.error(
        "❌ Order email FAILED:",
        emailErr?.message || emailErr
      );
      // We do NOT fail the order if email fails
    }

    res.json({ orderId: order.insertId });
  } catch (err) {
    await conn.rollback();
    console.error("❌ Failed to create order:", err.message);
    res.status(500).json({ message: "Order failed" });
  } finally {
    conn.release();
  }
}

// ✅ Export both functions so routes work
module.exports = { getOrders, createOrder };
