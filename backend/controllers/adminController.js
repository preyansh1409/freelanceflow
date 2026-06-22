const db = require('../config/db');

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

module.exports = { getUsersData };
