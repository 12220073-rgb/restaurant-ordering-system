// backend/routes/customers.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // your MySQL/Postgres/MongoDB connection

// GET all customers
router.get("/admin", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT id, name, email, phone FROM customers ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
