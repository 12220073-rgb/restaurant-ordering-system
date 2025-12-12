// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const itemsRouter = require('./routes/items');
const ordersRouter = require('./routes/orders');
require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

/* Middleware */
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json());

// Request logger (dev)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

/* Routes */
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => res.send('Restaurant backend is running!'));

app.use('/api/items', itemsRouter);
app.use('/api/orders', ordersRouter);

/* Errors */
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

/* Start */
app.listen(PORT, () => {
  console.log(`🔥 Backend running on http://localhost:${PORT}`);
});
