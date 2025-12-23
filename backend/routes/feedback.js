const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getAllFeedbackAdmin,
  deleteFeedbackAdmin,
} = require("../controllers/feedbackController");

// Customer submits feedback
router.post("/", createFeedback);

// Admin reads all feedback
router.get("/admin", getAllFeedbackAdmin);

// Admin deletes feedback
router.delete("/admin/:id", deleteFeedbackAdmin);

module.exports = router;
