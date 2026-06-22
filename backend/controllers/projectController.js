const db = require('../config/db');

const getAllProjects = async (req, res, next) => {
  try {
    const { status, client_id } = req.query;
    let query = `
      SELECT p.*, c.name AS client_name, c.company AS client_company, c.hourly_rate,
        COUNT(DISTINCT t.id) AS task_count,
        COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) AS done_tasks,
        COALESCE(SUM(tl.duration_minutes), 0) AS total_minutes,
        COALESCE(SUM(tl.amount), 0) AS total_billed_amount
      FROM projects p
      JOIN clients c ON c.id = p.client_id
      LEFT JOIN tasks t ON t.project_id = p.id
      LEFT JOIN time_logs tl ON tl.project_id = p.id AND tl.end_time IS NOT NULL
      WHERE p.user_id = ?`;
    const params = [req.user.id];

    if (status)    { query += ' AND p.status = ?';    params.push(status); }
    if (client_id) { query += ' AND p.client_id = ?'; params.push(client_id); }

    query += ' GROUP BY p.id, c.id ORDER BY p.created_at DESC';

    const [projects] = await db.query(query, params);

    // Compute burn rate percentage for each project
    const enriched = projects.map(p => ({
      ...p,
      burn_rate_pct: p.budget > 0 ? Math.min(100, Math.round((p.total_billed_amount / p.budget) * 100)) : 0,
    }));

    res.json(enriched);
  } catch (err) { next(err); }
};

const getProjectById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.name AS client_name, c.company AS client_company, c.hourly_rate, c.currency
       FROM projects p JOIN clients c ON c.id = p.client_id
       WHERE p.id = ? AND p.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Project not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const createProject = async (req, res, next) => {
  try {
    const { client_id, name, description, status, budget, start_date, end_date, color, billing_type, duration } = req.body;
    if (!client_id || !name) return res.status(400).json({ message: 'Client ID and project name are required' });

    // Verify client belongs to user
    const [client] = await db.query('SELECT id FROM clients WHERE id = ? AND user_id = ?', [client_id, req.user.id]);
    if (client.length === 0) return res.status(404).json({ message: 'Client not found' });

    const [result] = await db.query(
      `INSERT INTO projects (user_id, client_id, name, description, status, billing_type, duration, budget, start_date, end_date, color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, client_id, name, description || null, status || 'active', billing_type || 'hourly', duration || null, budget || 0, start_date || null, end_date || null, color || '#4F46E5']
    );
    const [created] = await db.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
    res.status(201).json(created[0]);
  } catch (err) { next(err); }
};

const updateProject = async (req, res, next) => {
  try {
    const { name, description, status, budget, start_date, end_date, color, billing_type, duration } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const [result] = await db.query(
      `UPDATE projects SET name=?, description=?, status=?, billing_type=?, duration=?, budget=?, start_date=?, end_date=?, color=?
       WHERE id = ? AND user_id = ?`,
      [name, description || null, status || 'active', billing_type || 'hourly', duration || null, budget || 0, start_date || null, end_date || null, color || '#4F46E5', req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Project not found' });
    const [updated] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) { next(err); }
};

const deleteProject = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject };
