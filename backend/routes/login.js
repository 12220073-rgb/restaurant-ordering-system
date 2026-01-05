// backend/routes/login.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

/**
 * @route   POST /api/login
 * @desc    Login or register a user automatically
 * @access  Public
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user already exists
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      // Auto-create new user
      const username = name?.trim() || email.split("@")[0];
      await db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [username, email.trim(), password] // Plain text for local testing
      );
      console.log(`✅ New user created: ${username} (${email})`);
    } else {
      console.log(`ℹ️ User logged in: ${users[0].name} (${email})`);
    }

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;
