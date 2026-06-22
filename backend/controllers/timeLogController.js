const db = require('../config/db');

// Start a new timer session
const startTimer = async (req, res, next) => {
  try {
    const { project_id, task_id, description } = req.body;
    if (!project_id) return res.status(400).json({ message: 'Project ID is required' });

    // Check no timer already running
    const [running] = await db.query(
      'SELECT id FROM time_logs WHERE user_id = ? AND end_time IS NULL',
      [req.user.id]
    );
    if (running.length > 0) {
      return res.status(400).json({ message: 'A timer is already running. Stop it first.' });
    }

    // Get project's hourly rate
    const [proj] = await db.query(
      `SELECT p.id, c.hourly_rate FROM projects p
       JOIN clients c ON c.id = p.client_id
       WHERE p.id = ? AND p.user_id = ?`,
      [project_id, req.user.id]
    );
    if (proj.length === 0) return res.status(404).json({ message: 'Project not found' });

    const [result] = await db.query(
      'INSERT INTO time_logs (user_id, project_id, task_id, description, start_time, hourly_rate) VALUES (?,?,?,?,NOW(),?)',
      [req.user.id, project_id, task_id || null, description || null, proj[0].hourly_rate]
    );
    const [log] = await db.query('SELECT * FROM time_logs WHERE id = ?', [result.insertId]);
    res.status(201).json(log[0]);
  } catch (err) { next(err); }
};

// Stop the running timer
const stopTimer = async (req, res, next) => {
  try {
    const [running] = await db.query(
      'SELECT * FROM time_logs WHERE user_id = ? AND end_time IS NULL',
      [req.user.id]
    );
    if (running.length === 0) return res.status(400).json({ message: 'No timer running' });

    const log = running[0];
    await db.query('UPDATE time_logs SET end_time = NOW() WHERE id = ?', [log.id]);
    const [updated] = await db.query('SELECT * FROM time_logs WHERE id = ?', [log.id]);
    res.json(updated[0]);
  } catch (err) { next(err); }
};

// Manual entry (no timer)
const addManualEntry = async (req, res, next) => {
  try {
    const { project_id, task_id, description, start_time, end_time, hourly_rate } = req.body;
    if (!project_id || !start_time || !end_time) {
      return res.status(400).json({ message: 'Project ID, start time, and end time are required' });
    }

    const [proj] = await db.query(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [project_id, req.user.id]
    );
    if (proj.length === 0) return res.status(404).json({ message: 'Project not found' });

    const [result] = await db.query(
      `INSERT INTO time_logs (user_id, project_id, task_id, description, start_time, end_time, hourly_rate, is_manual)
       VALUES (?,?,?,?,?,?,?,1)`,
      [req.user.id, project_id, task_id || null, description || null, start_time, end_time, hourly_rate || 0]
    );
    const [log] = await db.query('SELECT * FROM time_logs WHERE id = ?', [result.insertId]);
    res.status(201).json(log[0]);
  } catch (err) { next(err); }
};

// Get running timer (if any)
const getRunningTimer = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT tl.*, p.name AS project_name
       FROM time_logs tl
       JOIN projects p ON p.id = tl.project_id
       WHERE tl.user_id = ? AND tl.end_time IS NULL`,
      [req.user.id]
    );
    res.json(rows[0] || null);
  } catch (err) { next(err); }
};

// All logs for a project
const getLogsByProject = async (req, res, next) => {
  try {
    const [logs] = await db.query(
      `SELECT tl.*, t.title AS task_title
       FROM time_logs tl
       LEFT JOIN tasks t ON t.id = tl.task_id
       WHERE tl.project_id = ? AND tl.user_id = ?
         AND tl.end_time IS NOT NULL
       ORDER BY tl.start_time DESC`,
      [req.params.projectId, req.user.id]
    );
    res.json(logs);
  } catch (err) { next(err); }
};

// All logs for the user
const getAllLogs = async (req, res, next) => {
  try {
    const { project_id, is_billed } = req.query;
    let query = `
      SELECT tl.*, p.name AS project_name, c.name AS client_name, t.title AS task_title
      FROM time_logs tl
      JOIN projects p ON p.id = tl.project_id
      JOIN clients c ON c.id = p.client_id
      LEFT JOIN tasks t ON t.id = tl.task_id
      WHERE tl.user_id = ? AND tl.end_time IS NOT NULL`;
    const params = [req.user.id];
    if (project_id) { query += ' AND tl.project_id = ?'; params.push(project_id); }
    if (is_billed !== undefined) { query += ' AND tl.is_billed = ?'; params.push(is_billed); }
    query += ' ORDER BY tl.start_time DESC';

    const [logs] = await db.query(query, params);
    res.json(logs);
  } catch (err) { next(err); }
};

const deleteLog = async (req, res, next) => {
  try {
    const [result] = await db.query(
      'DELETE FROM time_logs WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Log not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

module.exports = { startTimer, stopTimer, addManualEntry, getRunningTimer, getLogsByProject, getAllLogs, deleteLog };
