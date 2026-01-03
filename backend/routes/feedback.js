// backend/routes/feedback.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // ✅ updated path

// GET feedback
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM feedback");
    res.json(rows);
  } catch (err) {
    console.error("Feedback GET error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST feedback
router.post("/", async (req, res) => {
  try {
    const { userId, message, rating } = req.body;
    await db.query(
      "INSERT INTO feedback (user_id, message, rating) VALUES (?, ?, ?)",
      [userId, message, rating]
    );
    res.json({ message: "Feedback submitted" });
  } catch (err) {
    console.error("Feedback POST error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
