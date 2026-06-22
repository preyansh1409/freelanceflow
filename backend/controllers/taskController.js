const db = require('../config/db');

const getTasksByProject = async (req, res, next) => {
  try {
    const [tasks] = await db.query(
      `SELECT t.* FROM tasks t
       JOIN projects p ON p.id = t.project_id
       WHERE t.project_id = ? AND t.user_id = ? AND p.user_id = ?
       ORDER BY
         FIELD(t.priority, 'urgent','high','medium','low'),
         t.due_date ASC`,
      [req.params.projectId, req.user.id, req.user.id]
    );
    res.json(tasks);
  } catch (err) { next(err); }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    let query = `
      SELECT t.*, p.name AS project_name, c.name AS client_name
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
      JOIN clients c ON c.id = p.client_id
      WHERE t.user_id = ?`;
    const params = [req.user.id];
    if (status)   { query += ' AND t.status = ?';   params.push(status); }
    if (priority) { query += ' AND t.priority = ?'; params.push(priority); }
    query += ' ORDER BY FIELD(t.priority,"urgent","high","medium","low"), t.due_date ASC';

    const [tasks] = await db.query(query, params);
    res.json(tasks);
  } catch (err) { next(err); }
};

const createTask = async (req, res, next) => {
  try {
    const { project_id, title, description, status, priority, due_date, estimated_hours } = req.body;
    if (!project_id || !title) return res.status(400).json({ message: 'Project ID and title are required' });

    const [proj] = await db.query('SELECT id FROM projects WHERE id = ? AND user_id = ?', [project_id, req.user.id]);
    if (proj.length === 0) return res.status(404).json({ message: 'Project not found' });

    const [result] = await db.query(
      'INSERT INTO tasks (project_id, user_id, title, description, status, priority, estimated_hours, due_date) VALUES (?,?,?,?,?,?,?,?)',
      [project_id, req.user.id, title, description || null, status || 'todo', priority || 'medium', estimated_hours || null, due_date || null]
    );
    const [created] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(created[0]);
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, due_date, estimated_hours } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const [result] = await db.query(
      'UPDATE tasks SET title=?, description=?, status=?, priority=?, estimated_hours=?, due_date=? WHERE id=? AND user_id=?',
      [title, description || null, status || 'todo', priority || 'medium', estimated_hours || null, due_date || null, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Task not found' });
    const [updated] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
};

module.exports = { getTasksByProject, getAllTasks, createTask, updateTask, deleteTask };
