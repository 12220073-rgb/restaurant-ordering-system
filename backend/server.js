const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const itemsRouter = require('./routes/items');
const ordersRouter = require('./routes/orders');

app.use('/api/items', itemsRouter);
app.use('/api/orders', ordersRouter);

// Health check route
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Root route for Render & browser
app.get('/', (req, res) => {
  res.send('Restaurant backend is running!');
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
