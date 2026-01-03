// backend/routes/login.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // ✅ updated path

// POST /api/login
router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Check if user exists
    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (!existingUser || existingUser.length === 0) {
      // Insert new user if not exists
      const username = name || email.split("@")[0]; // default name from email
      await db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [username, email, password] // ⚠️ In production, hash passwords!
      );
    }

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
