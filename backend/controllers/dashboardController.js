const db = require('../config/db');

const getStats = async (req, res, next) => {
  try {
    const uid = req.user.id;

    const [[{ active_projects }]] = await db.query(
      "SELECT COUNT(*) AS active_projects FROM projects WHERE user_id=? AND status='active'", [uid]);

    const [[{ pending_invoices, pending_amount }]] = await db.query(
      "SELECT COUNT(*) AS pending_invoices, COALESCE(SUM(total),0) AS pending_amount FROM invoices WHERE user_id=? AND status IN ('sent','overdue')", [uid]);

    const [[{ total_revenue }]] = await db.query(
      "SELECT COALESCE(SUM(total),0) AS total_revenue FROM invoices WHERE user_id=? AND status='paid'", [uid]);

    const [[{ overdue_tasks }]] = await db.query(
      "SELECT COUNT(*) AS overdue_tasks FROM tasks WHERE user_id=? AND status!='done' AND due_date < CURDATE()", [uid]);

    res.json({ active_projects, pending_invoices, pending_amount, total_revenue, overdue_tasks });
  } catch (err) { next(err); }
};

// Monthly revenue for the last 12 months
const getRevenueChart = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE_FORMAT(issue_date, '%b %Y') AS month,
              DATE_FORMAT(issue_date, '%Y-%m') AS sort_key,
              SUM(total) AS revenue
       FROM invoices
       WHERE user_id = ? AND status = 'paid'
         AND issue_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
       GROUP BY sort_key, month
       ORDER BY sort_key ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// Project status distribution for donut chart
const getProjectStatusChart = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT status, COUNT(*) AS count FROM projects WHERE user_id = ? GROUP BY status',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

module.exports = { getStats, getRevenueChart, getProjectStatusChart };
