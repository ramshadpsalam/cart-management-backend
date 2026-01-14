const pool = require('./database');
const bcrypt = require('bcrypt');

const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('superadmin', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create carts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      );
    `);

    // Check if default users exist
    const superadminExists = await pool.query(
      "SELECT * FROM users WHERE email = 'superadmin@test.com'"
    );

    if (superadminExists.rows.length === 0) {
      console.log('Creating default users...');
      
      // Create superadmin
      const hashedPassword = await bcrypt.hash('super123', 10);
      await pool.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
        ['superadmin@test.com', hashedPassword, 'Super Admin', 'superadmin']
      );

      // Create regular admin
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
        ['admin@test.com', hashedAdminPassword, 'Regular Admin', 'admin']
      );

      // Add sample products
      console.log('Creating sample products...');
      await pool.query(`
        INSERT INTO products (name, description, price, stock, image_url) VALUES
        ('Laptop', 'High-performance laptop with 16GB RAM', 999.99, 10, 'https://via.placeholder.com/150'),
        ('Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 50, 'https://via.placeholder.com/150'),
        ('Mechanical Keyboard', 'RGB mechanical keyboard', 79.99, 30, 'https://via.placeholder.com/150'),
        ('USB-C Hub', '7-in-1 USB-C hub adapter', 49.99, 25, 'https://via.placeholder.com/150'),
        ('Webcam', '1080p HD webcam', 89.99, 15, 'https://via.placeholder.com/150')
      `);
    }

    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
    throw err;
  }
};

module.exports = initializeDatabase;