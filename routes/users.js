const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, checkRole } = require('../middleware/auth');

// Get all users (superadmin only)
router.get('/', authenticateToken, checkRole('superadmin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// Get all carts (superadmin only)
router.get('/carts', authenticateToken, checkRole('superadmin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.quantity, 
        c.product_id, 
        c.user_id,
        u.name as user_name, 
        u.email as user_email,
        p.name as product_name, 
        p.price
      FROM carts c
      JOIN users u ON c.user_id = u.id
      JOIN products p ON c.product_id = p.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get all carts error:', err);
    res.status(500).json({ error: 'Server error fetching carts' });
  }
});

module.exports = router;