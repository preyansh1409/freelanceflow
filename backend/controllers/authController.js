const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check existing user
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 12);
    const colors = ['#4F46E5','#7C3AED','#0891B2','#059669','#D97706','#DC2626'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, avatar_color) VALUES (?, ?, ?, ?)',
      [name, email, hash, avatarColor]
    );

    const token = jwt.sign(
      { id: result.insertId, email, plan: 'free' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: result.insertId, name, email, plan: 'free', avatarColor },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan, avatarColor: user.avatar_color },
    });
  } catch (err) { next(err); }
};

// GET /api/auth/me  (protected)
const getMe = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, plan, avatar_color, expertise, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email, expertise } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

    // Verify email not taken by another user
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email already in use' });

    await db.query('UPDATE users SET name = ?, email = ?, expertise = ? WHERE id = ?', [name, email, expertise || null, req.user.id]);
    res.json({ message: 'Profile updated' });
  } catch (err) { next(err); }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Passwords are required' });

    const [rows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = rows[0];
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(400).json({ message: 'Incorrect current password' });

    const hash = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (err) { next(err); }
};

const deleteAccount = async (req, res, next) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Account deleted' });
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, updateProfile, updatePassword, deleteAccount };
