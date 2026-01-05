// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ==============================
// Middleware
// ==============================
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // React frontend
app.use(express.json()); // Parse JSON body

// ==============================
// Routes
// ==============================
const loginRouter = require('./routes/login');
const usersRouter = require('./routes/users');
const itemsRouter = require('./routes/items');
const ordersRouter = require('./routes/orders');
const feedbackRouter = require('./routes/feedback');

app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);
app.use('/api/items', itemsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/feedback', feedbackRouter);

// ==============================
// Health check
// ==============================
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Root route
app.get('/', (req, res) => res.send('🔥 Restaurant Backend Running!'));

// ==============================
// 404 Handler
// ==============================
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

// ==============================
// Global Error Handler
// ==============================
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({ message: 'Internal Server Error' });
});

// ==============================
// Start Server
// ==============================
app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));
