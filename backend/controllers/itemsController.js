const db = require("../config/db");

/**
 * GET all menu items
 */
exports.getAllItems = async (req, res) => {
  try {
    const sql = `
      SELECT 
        mi.id,
        mi.name,
        mi.price,
        c.name AS category
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      ORDER BY mi.id
    `;

    const [rows] = await db.query(sql);

    res.status(200).json(rows);

  } catch (error) {
    console.error("❌ Error fetching menu items:", error);
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
};
