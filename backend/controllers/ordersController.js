const db = require('../config/db');
const { sendOrderEmail } = require('../config/mailer');

// ✅ Create a new order
exports.createOrder = async (req, res) => {
  const { fullName, phoneNumber, notes, items } = req.body;

  if (!fullName || !phoneNumber || !items || items.length === 0) {
    return res.status(400).json({ message: 'Invalid order data' });
  }

  try {
    const total = items.reduce((sum, it) => sum + it.qty * it.price, 0);

    // Insert into orders table
    const [orderResult] = await db.query(
      'INSERT INTO orders (customer_name, customer_phone, customer_address, total) VALUES (?, ?, ?, ?)',
      [fullName, phoneNumber, notes || null, total]
    );

    const orderId = orderResult.insertId;

    // Insert items including item_name
    const insertItems = items.map(it =>
      db.query(
        'INSERT INTO order_items (order_id, item_id, item_name, quantity, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, it.item_id, it.item_name, it.qty, it.qty * it.price]
      )
    );

    await Promise.all(insertItems);

    // Send email notification
    try {
      await sendOrderEmail({
        fullName,
        phoneNumber,
        notes,
        orderId,
        date: new Date().toISOString(),
        items,
        total
      });
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr);
      // Don't fail the order if email fails
    }

    // ✅ Return only name, items, total for frontend
    res.status(201).json({
      message: 'Order submitted successfully',
      order: {
        customer_name: fullName,
        items: items.map(it => ({ item_name: it.item_name, quantity: it.qty })),
        total
      }
    });
  } catch (err) {
    console.error('❌ SQL Error creating order:', err.sqlMessage || err);
    res.status(500).json({ message: 'Failed to submit order' });
  }
};

// ✅ Get previous orders (name, items, total only)
exports.getOrders = async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.status(400).json([]);

  try {
    const [orders] = await db.query(
      'SELECT id, customer_name, total FROM orders WHERE customer_phone = ? ORDER BY order_date DESC',
      [phone]
    );

    const ordersWithItems = await Promise.all(
      orders.map(async order => {
        const [items] = await db.query(
          'SELECT item_name, quantity FROM order_items WHERE order_id = ?',
          [order.id]
        );
        return { customer_name: order.customer_name, items, total: order.total };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    res.status(500).json([]);
  }
};

