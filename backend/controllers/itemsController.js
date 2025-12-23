const db = require('../config/db');

// GET all menu items
async function getAllItems(req, res) {
  try {
    const [rows] = await db.query(`
      SELECT
        mi.id AS item_id,
        mi.name AS item_name,
        mi.price,
        c.name AS category
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      ORDER BY c.id, mi.id
    `);
    res.json(rows);
  } catch (err) {
    console.error('getAllItems error:', err);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
}

// POST create new menu item
async function addItem(req, res) {
  try {
    const { item_name, price, category } = req.body;
    if (!item_name?.trim() || !price || !category?.trim()) {
      return res.status(400).json({ message: 'Name, price, and category are required.' });
    }

    // Get category
    const [[cat]] = await db.query(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1',
      [category.trim()]
    );
    if (!cat) return res.status(400).json({ message: 'Category does not exist.' });

    // Check duplicate item
    const [existing] = await db.query(
      'SELECT id FROM menu_items WHERE LOWER(name) = LOWER(?) AND category_id = ?',
      [item_name.trim(), cat.id]
    );
    if (existing.length) return res.status(409).json({ message: 'Item already exists in this category.' });

    // Insert new item
    const [{ insertId }] = await db.query(
      'INSERT INTO menu_items (name, price, category_id) VALUES (?, ?, ?)',
      [item_name.trim(), price, cat.id]
    );

    res.status(201).json({ item_id: insertId, item_name, price, category });

  } catch (err) {
    console.error('addItem error:', err);
    res.status(500).json({ message: 'Failed to add item' });
  }
}

module.exports = { getAllItems, addItem };
