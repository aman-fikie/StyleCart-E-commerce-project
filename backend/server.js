const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

require('./src/db/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth',     require('./src/routes/auth'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/cart',     require('./src/routes/cart'));
app.use('/api/orders',   require('./src/routes/orders'));

app.get('/api', (req, res) => {
  res.json({ message: 'StyleHub API is running! 🚀' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});