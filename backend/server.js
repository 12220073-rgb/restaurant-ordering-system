// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'https://restaurant-ordering-system-nu.vercel.app', // <-- your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// DB Connection
const pool = require('./config/db');

// Routes
const itemsRouter = require('./routes/items');
const ordersRouter = require('./routes/orders');

app.use('/api/items', itemsRouter);
app.use('/api/orders', ordersRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root route
app.get('/', (req, res) => {
  res.send('Restaurant backend is running!');
});

app.listen(PORT, () => {
  console.log(`🔥 Backend running on port ${PORT}`);
});
