const db = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/admin/users
const getUsersData = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.password_hash AS password,
        u.plan, 
        u.expertise, 
        u.created_at,
        COUNT(DISTINCT c.id) AS client_count,
        COUNT(DISTINCT p.id) AS project_count,
        COUNT(DISTINCT i.id) AS invoice_count
      FROM users u
      LEFT JOIN clients c ON c.user_id = u.id
      LEFT JOIN projects p ON p.user_id = u.id
      LEFT JOIN invoices i ON i.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id
const updateUserData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, plan, expertise, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Verify email is not already taken by another user
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Check if updating password
    if (password && password.trim() !== '') {
      const hash = await bcrypt.hash(password, 12);
      await db.query(
        'UPDATE users SET name = ?, email = ?, plan = ?, expertise = ?, password_hash = ? WHERE id = ?',
        [name, email, plan || 'free', expertise || null, hash, id]
      );
    } else {
      await db.query(
        'UPDATE users SET name = ?, email = ?, plan = ?, expertise = ? WHERE id = ?',
        [name, email, plan || 'free', expertise || null, id]
      );
    }

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
const deleteUserData = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsersData, updateUserData, deleteUserData };

