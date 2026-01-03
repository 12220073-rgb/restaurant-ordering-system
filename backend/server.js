// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const loginRouter = require("./routes/login");
const feedbackRouter = require("./routes/feedback");
const ordersRouter = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/login", loginRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/orders", ordersRouter);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Root
app.get("/", (req, res) => res.send("Restaurant backend running"));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Not Found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => console.log(`🔥 Backend running at http://localhost:${PORT}`));
