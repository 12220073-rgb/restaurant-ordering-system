const express = require("express");
const router = express.Router();
const db = require("../config/db");

/**
 * @route   GET /api/users/admin
 * @desc    Fetch all users for Admin
 * @access  Admin
 */
router.get("/admin", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY id DESC"
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Fetch users error:", err.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/**
 * @route   DELETE /api/users/admin/:id
 * @desc    Delete a user by ID (Admin only)
 * @access  Admin
 */
router.delete("/admin/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const [user] = await db.query("SELECT role FROM users WHERE id = ?", [userId]);
    if (!user.length) return res.status(404).json({ message: "User not found" });

    if (user[0].role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    await db.query("DELETE FROM users WHERE id = ?", [userId]);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Delete user error:", err.message);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

module.exports = router;
