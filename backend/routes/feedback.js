const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Helpers to detect columns safely
async function getFeedbackColumns() {
  const [cols] = await db.query(`SHOW COLUMNS FROM feedback`);
  const names = (cols || []).map((c) => c.Field);
  return new Set(names);
}

function pickCol(set, candidates) {
  return candidates.find((c) => set.has(c)) || null;
}

/**
 * @route   POST /api/feedback
 * @desc    Create feedback (Customer)
 * @access  Customer/Public
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, comment, message, feedback, text } = req.body;

    // accept comment from multiple possible keys
    const incomingComment =
      comment ?? message ?? feedback ?? text ?? "";

    if (!incomingComment || !String(incomingComment).trim()) {
      return res.status(400).json({ message: "Feedback is required" });
    }

    const safeName =
      name && String(name).trim() ? String(name).trim() : "Anonymous";
    const safeEmail =
      email && String(email).trim() ? String(email).trim() : null;
    const safeComment = String(incomingComment).trim();

    const colSet = await getFeedbackColumns();

    // Detect columns (supports many schemas)
    const nameCol = pickCol(colSet, ["name", "customer_name", "full_name"]);
    const emailCol = pickCol(colSet, ["email", "customer_email"]);
    const commentCol = pickCol(colSet, ["comment", "message", "feedback", "text", "content"]);
    const createdCol = pickCol(colSet, ["created_at", "createdAt", "date", "created_on", "created"]);

    if (!commentCol) {
      return res.status(500).json({
        message: "Feedback table has no comment/message column (comment/message/feedback/text).",
      });
    }

    // Build INSERT dynamically
    const columns = [];
    const values = [];
    const params = [];

    if (nameCol) {
      columns.push(nameCol);
      values.push("?");
      params.push(safeName);
    }

    if (emailCol) {
      columns.push(emailCol);
      values.push("?");
      params.push(safeEmail);
    }

    columns.push(commentCol);
    values.push("?");
    params.push(safeComment);

    if (createdCol) {
      columns.push(createdCol);
      values.push("NOW()");
      // no param for NOW()
    }

    const sql = `INSERT INTO feedback (${columns.join(", ")}) VALUES (${values.join(", ")})`;
    const [result] = await db.query(sql, params);

    console.log("✅ Feedback saved, id:", result?.insertId);

    res.status(201).json({ message: "Feedback saved successfully", id: result?.insertId ?? null });
  } catch (err) {
    console.error("❌ Feedback POST error:", err.message);
    res.status(500).json({ message: "Failed to save feedback" });
  }
});

/**
 * @route   GET /api/feedback/admin
 * @desc    Get all feedback for Admin
 * @access  Admin
 */
router.get("/admin", async (req, res) => {
  try {
    const colSet = await getFeedbackColumns();

    const idCol = pickCol(colSet, ["id", "feedback_id"]);
    const nameCol = pickCol(colSet, ["name", "customer_name", "full_name"]);
    const emailCol = pickCol(colSet, ["email", "customer_email"]);
    const commentCol = pickCol(colSet, ["comment", "message", "feedback", "text", "content"]);
    const createdCol = pickCol(colSet, ["created_at", "createdAt", "date", "created_on", "created"]);

    if (!idCol || !commentCol) {
      return res.status(500).json({ message: "Feedback table schema is missing required columns." });
    }

    // Select + normalize fields for frontend
    const selectParts = [
      `${idCol} AS id`,
      nameCol ? `${nameCol} AS name` : `'Anonymous' AS name`,
      emailCol ? `${emailCol} AS email` : `NULL AS email`,
      `${commentCol} AS comment`,
      createdCol ? `${createdCol} AS created_at` : `NULL AS created_at`,
    ];

    const orderBy = createdCol ? `ORDER BY ${createdCol} DESC` : `ORDER BY ${idCol} DESC`;

    const [rows] = await db.query(
      `SELECT ${selectParts.join(", ")} FROM feedback ${orderBy}`
    );

    res.status(200).json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error("❌ Feedback GET error:", err.message);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

/**
 * @route   DELETE /api/feedback/admin/:id
 * @desc    Delete feedback by ID (Admin)
 * @access  Admin
 */
router.delete("/admin/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const colSet = await getFeedbackColumns();
    const idCol = pickCol(colSet, ["id", "feedback_id"]);
    if (!idCol) return res.status(500).json({ message: "Feedback id column not found." });

    const [found] = await db.query(`SELECT ${idCol} FROM feedback WHERE ${idCol} = ?`, [id]);
    if (!found.length) return res.status(404).json({ message: "Feedback not found" });

    await db.query(`DELETE FROM feedback WHERE ${idCol} = ?`, [id]);
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (err) {
    console.error("❌ Delete feedback error:", err.message);
    res.status(500).json({ message: "Failed to delete feedback" });
  }
});

module.exports = router;
