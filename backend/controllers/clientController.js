const db = require('../config/db');

// ALL queries scoped to req.user.id — CRITICAL for data isolation
const getAllClients = async (req, res, next) => {
  try {
    const [clients] = await db.query(
      `SELECT c.*,
        COUNT(DISTINCT p.id) AS project_count,
        SUM(CASE WHEN p.status = 'active' THEN 1 ELSE 0 END) AS active_projects
       FROM clients c
       LEFT JOIN projects p ON p.client_id = c.id AND p.user_id = ?
       WHERE c.user_id = ?
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [req.user.id, req.user.id]
    );
    res.json(clients);
  } catch (err) { next(err); }
};

const getClientById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM clients WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Client not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const createClient = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, hourly_rate, currency, notes } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const [result] = await db.query(
      `INSERT INTO clients (user_id, name, email, phone, company, address, hourly_rate, currency, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, email || null, phone || null, company || null, address || null, hourly_rate || 0, currency || 'INR', notes || null]
    );
    const [created] = await db.query('SELECT * FROM clients WHERE id = ?', [result.insertId]);
    res.status(201).json(created[0]);
  } catch (err) { next(err); }
};

const updateClient = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, hourly_rate, currency, notes } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    await db.query(
      `UPDATE clients SET name=?, email=?, phone=?, company=?, address=?, hourly_rate=?, currency=?, notes=?
       WHERE id = ? AND user_id = ?`,
      [name, email || null, phone || null, company || null, address || null, hourly_rate || 0, currency || 'INR', notes || null, req.params.id, req.user.id]
    );
    const [updated] = await db.query('SELECT * FROM clients WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (updated.length === 0) return res.status(404).json({ message: 'Client not found' });
    res.json(updated[0]);
  } catch (err) { next(err); }
};

const deleteClient = async (req, res, next) => {
  try {
    const [result] = await db.query(
      'DELETE FROM clients WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAllClients, getClientById, createClient, updateClient, deleteClient };
