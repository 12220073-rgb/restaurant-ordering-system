// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const itemsRouter = require("./routes/items");
const ordersRouter = require("./routes/orders");
const feedbackRouter = require("./routes/feedback");

require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS (dev + production) ---
const allowedOrigins = [
  process.env.FRONTEND_URL, // set this on Railway (your Vercel domain)
  "http://localhost:3000",  // local dev
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl/Postman/mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// --- Middleware ---
app.use(express.json());

// Request logger (dev only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// --- Routes ---
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/", (req, res) => res.send("Restaurant backend is running!"));

app.use("/api/items", itemsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/feedback", feedbackRouter);

// --- Errors ---
app.use((req, res) => res.status(404).json({ message: "Not Found" }));

app.use((err, req, res, next) => {
  console.error(err);

  // If CORS blocked it, return a clear message
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS: Origin not allowed" });
  }

  return res.status(500).json({ message: "Internal Server Error" });
});

// --- Start (bind to 0.0.0.0 for Railway) ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Backend running on port ${PORT}`);
});
