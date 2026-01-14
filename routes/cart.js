const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get user cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.quantity, 
        c.product_id,
        p.name, 
        p.description, 
        p.price, 
        p.stock, 
        p.image_url
      FROM carts c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: 'Server error fetching cart' });
  }
});

// Add to cart
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists and has stock
    const product = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [product_id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.rows[0].stock < (quantity || 1)) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already in cart
    const existing = await pool.query(
      'SELECT * FROM carts WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update quantity
      result = await pool.query(
        `UPDATE carts 
         SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $2 AND product_id = $3 
         RETURNING *`,
        [quantity || 1, req.user.id, product_id]
      );
    } else {
      // Insert new item
      result = await pool.query(
        `INSERT INTO carts (user_id, product_id, quantity) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [req.user.id, product_id, quantity || 1]
      );
    }

    res.status(201).json({
      message: 'Product added to cart',
      cart_item: result.rows[0]
    });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Server error adding to cart' });
  }
});

// Update cart item quantity
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined || quantity <= 0) {
      return res.status(400).json({ 
        error: 'Quantity must be greater than 0' 
      });
    }

    const result = await pool.query(
      `UPDATE carts 
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND user_id = $3 
       RETURNING *`,
      [quantity, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({
      message: 'Cart updated',
      cart_item: result.rows[0]
    });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ error: 'Server error updating cart' });
  }
});

// Remove from cart
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM carts WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ 
      message: 'Item removed from cart',
      cart_item: result.rows[0]
    });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ error: 'Server error removing from cart' });
  }
});

// Clear cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM carts WHERE user_id = $1',
      [req.user.id]
    );

    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ error: 'Server error clearing cart' });
  }
});

module.exports = router;