const express = require("express");
const router = express.Router();
const db = require("../db"); // ⚠️ make sure this matches your db connection file

// ===============================
// GET all users (Admin Customers)
// ===============================
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email FROM users ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ===============================
// DELETE user
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("❌ Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

module.exports = router;
