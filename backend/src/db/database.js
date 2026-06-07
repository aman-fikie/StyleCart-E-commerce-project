const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL —', process.env.DB_NAME);
    release();
  }
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(150) UNIQUE NOT NULL,
        password   VARCHAR(255) NOT NULL,
        role       VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(200) NOT NULL,
        description TEXT,
        price       DECIMAL(10,2) NOT NULL,
        stock       INTEGER DEFAULT 0,
        category    VARCHAR(100),
        size        VARCHAR(50),
        image_url   VARCHAR(500),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity   INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id           SERIAL PRIMARY KEY,
        user_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status       VARCHAR(50) DEFAULT 'pending',
        address      TEXT,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id         SERIAL PRIMARY KEY,
        order_id   INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        quantity   INTEGER NOT NULL,
        price      DECIMAL(10,2) NOT NULL
      )
    `);

    // Seed sample products if empty
    const { rows } = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO products (name, description, price, stock, category, size, image_url)
        VALUES
          ('Classic White T-Shirt',  'Premium cotton everyday tee',      19.99, 50, 'T-Shirts', 'M',  'https://via.placeholder.com/300x400?text=White+Tee'),
          ('Slim Fit Jeans',          'Dark wash slim fit denim',         49.99, 30, 'Jeans',    '32', 'https://via.placeholder.com/300x400?text=Slim+Jeans'),
          ('Floral Summer Dress',     'Light chiffon floral print',       39.99, 25, 'Dresses',  'S',  'https://via.placeholder.com/300x400?text=Floral+Dress'),
          ('Leather Jacket',          'Genuine leather biker jacket',    129.99, 15, 'Jackets',  'L',  'https://via.placeholder.com/300x400?text=Leather+Jacket'),
          ('Running Sneakers',        'Lightweight mesh sport shoes',     79.99, 40, 'Shoes',    '42', 'https://via.placeholder.com/300x400?text=Sneakers'),
          ('Wool Sweater',            'Cozy merino wool pullover',        59.99, 20, 'Sweaters', 'XL', 'https://via.placeholder.com/300x400?text=Wool+Sweater')
      `);
      console.log('✅ Sample products seeded');
    }

    console.log('✅ All tables ready');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  }
};

initDB();
module.exports = pool;