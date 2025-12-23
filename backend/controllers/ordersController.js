const db = require("../config/db");
const { sendOrderEmail } = require("../config/mailer");

// Create a new order
exports.createOrder = async (req, res) => {
  const { fullName, phoneNumber, notes, items, date, orderId } = req.body;
  if (!fullName || !phoneNumber || !Array.isArray(items) || !items.length)
    return res.status(400).json({ message: "Invalid order data" });

  try {
    const total = items.reduce((sum, it) => sum + Number(it?.qty || 0) * Number(it?.price || 0), 0);

    const [orderResult] = await db.query(
      "INSERT INTO orders (customer_name, customer_phone, additional_notes, total) VALUES (?, ?, ?, ?)",
      [fullName, phoneNumber, notes || null, total]
    );

    const newDbOrderId = orderResult.insertId;

    await Promise.all(
      items.map(it =>
        db.query(
          "INSERT INTO order_items (order_id, item_id, item_name, quantity, subtotal) VALUES (?, ?, ?, ?, ?)",
          [newDbOrderId, it.item_id, it.item_name, it.qty, Number(it.qty) * Number(it.price)]
        )
      )
    );

    // Send email (do not break order if email fails)
    sendOrderEmail({
      fullName, phoneNumber, notes, items, total,
      date: date || new Date().toISOString(),
      orderId: orderId || newDbOrderId,
    }).catch(err => console.error("❌ Email failed:", err));

    res.status(201).json({
      message: "Order submitted successfully",
      order: {
        id: newDbOrderId,
        customer_name: fullName,
        items: items.map(it => ({ item_name: it.item_name, quantity: it.qty })),
        total,
      },
    });
  } catch (err) {
    console.error("❌ SQL Error creating order:", err.sqlMessage || err);
    res.status(500).json({ message: "Failed to submit order" });
  }
};

// Get previous orders by phone
exports.getOrders = async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.status(400).json([]);

  try {
    const [orders] = await db.query(
      "SELECT id, customer_name, total, order_date FROM orders WHERE customer_phone = ? ORDER BY order_date DESC",
      [phone]
    );

    const ordersWithItems = await Promise.all(
      orders.map(async order => {
        const [items] = await db.query(
          "SELECT item_name, quantity FROM order_items WHERE order_id = ?",
          [order.id]
        );
        return { ...order, items, date: order.order_date };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    console.error("❌ Error fetching orders:", err.sqlMessage || err);
    res.status(500).json([]);
  }
};

// Admin: Get all orders + items
exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT id, customer_name, customer_phone, additional_notes, total, order_date FROM orders ORDER BY id DESC"
    );
    const [items] = await db.query(
      "SELECT order_id, item_name, quantity FROM order_items ORDER BY id DESC"
    );

    const map = new Map();
    orders.forEach(o => map.set(o.id, { ...o, items: [] }));
    items.forEach(i => map.get(i.order_id)?.items.push({ item_name: i.item_name, qty: i.quantity }));

    res.json([...map.values()]);
  } catch (err) {
    console.error("❌ getAllOrdersAdmin error:", err.sqlMessage || err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Admin: Delete order by id
exports.deleteOrderAdmin = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid order id" });

  try {
    const [r] = await db.query("DELETE FROM orders WHERE id = ?", [id]);
    if (!r.affectedRows) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("❌ deleteOrderAdmin error:", err.sqlMessage || err);
    res.status(500).json({ message: "Failed to delete order" });
  }
};
