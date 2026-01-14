const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, checkRole } = require('../middleware/auth');

// Get all products
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

// Get single product
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Server error fetching product' });
  }
});

// Create product (admin and superadmin)
router.post('/', authenticateToken, checkRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { name, description, price, stock, image_url } = req.body;

    if (!name || !price || stock === undefined) {
      return res.status(400).json({ 
        error: 'Name, price, and stock are required' 
      });
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, image_url) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        name, 
        description || '', 
        price, 
        stock, 
        image_url || 'https://via.placeholder.com/150'
      ]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: result.rows[0]
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Server error creating product' });
  }
});

// Update product (admin and superadmin)
router.put('/:id', authenticateToken, checkRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { name, description, price, stock, image_url } = req.body;

    const result = await pool.query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, stock = $4, image_url = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING *`,
      [name, description, price, stock, image_url, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Server error updating product' });
  }
});

// Delete product (superadmin only)
router.delete('/:id', authenticateToken, checkRole('superadmin'), async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ 
      message: 'Product deleted successfully',
      product: result.rows[0]
    });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Server error deleting product' });
  }
});

module.exports = router;
