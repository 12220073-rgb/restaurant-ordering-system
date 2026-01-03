const db = require('../config/db');

/**
 * GET all menu items
 */
async function getAllItems(req, res) {
  try {
    const sql = `
      SELECT mi.id AS item_id,
             mi.name AS item_name,
             mi.price AS price,
             c.name AS category
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      ORDER BY c.id, mi.id
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("getAllItems error:", err);
    res.status(500).json({ message: "Failed to fetch items" });
  }
}

/**
 * POST create new menu item
 * Body expected: { item_name, price, category, description?, image? }
 */
async function addItem(req, res) {
  try {
    const { item_name, price, category } = req.body;

    if (!item_name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required." });
    }

    // 1) Check if category exists
    const [catRows] = await db.query(
      "SELECT id FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1",
      [category.trim()]
    );

    if (catRows.length === 0) {
      return res.status(400).json({ message: "Category does not exist." });
    }

    const category_id = catRows[0].id;

    // 2) Check duplicate item by name + category
    const [existing] = await db.query(
      "SELECT id FROM menu_items WHERE LOWER(name) = LOWER(?) AND category_id = ?",
      [item_name.trim(), category_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Item already exists in this category." });
    }

    // 3) Insert new item
    const [result] = await db.query(
      "INSERT INTO menu_items (name, price, category_id) VALUES (?, ?, ?)",
      [item_name.trim(), price, category_id]
    );

    const newId = result.insertId;

    // 4) Return the created item (same structure Menu.jsx expects)
    const newItem = {
      item_id: newId,
      item_name,
      price,
      category,
    };

    res.status(201).json(newItem);

  } catch (err) {
    console.error("addItem error:", err);
    res.status(500).json({ message: "Failed to add item" });
  }
}

module.exports = { getAllItems, addItem };
