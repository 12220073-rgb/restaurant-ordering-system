const db = require("../config/db");

// POST /api/feedback
exports.createFeedback = async (req, res) => {
  const { name, comment } = req.body;
  if (!comment?.trim()) return res.status(400).json({ message: "Comment is required" });

  try {
    const cleanName = (name || "Anonymous").trim().slice(0, 100);
    const cleanComment = comment.trim();

    const [r] = await db.query(
      "INSERT INTO feedback (name, comment) VALUES (?, ?)",
      [cleanName, cleanComment]
    );

    res.status(201).json({
      message: "Feedback saved",
      feedback: { id: r.insertId, name: cleanName, comment: cleanComment, created_at: new Date().toISOString() },
    });
  } catch (err) {
    console.error("createFeedback error:", err.sqlMessage || err);
    res.status(500).json({ message: "Failed to save feedback" });
  }
};

// GET /api/feedback/admin
exports.getAllFeedbackAdmin = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, comment, created_at FROM feedback ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("getAllFeedbackAdmin error:", err.sqlMessage || err);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
};

// DELETE /api/feedback/admin/:id
exports.deleteFeedbackAdmin = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid feedback id" });

  try {
    const [r] = await db.query("DELETE FROM feedback WHERE id = ?", [id]);
    if (!r.affectedRows) return res.status(404).json({ message: "Feedback not found" });
    res.json({ message: "Feedback deleted" });
  } catch (err) {
    console.error("deleteFeedbackAdmin error:", err.sqlMessage || err);
    res.status(500).json({ message: "Failed to delete feedback" });
  }
};