const bcrypt = require('bcryptjs');
const db = require('../config/db');

const loadSampleData = async (req, res, next) => {
  const uid = req.user.id;
  try {
    // 2 Sample Clients
    const [c1] = await db.query(
      `INSERT INTO clients (user_id, name, email, company, hourly_rate, currency)
       VALUES (?, 'Rahul Sharma', 'rahul@techcorp.in', 'TechCorp India', 2500, 'INR')`,
      [uid]
    );
    const [c2] = await db.query(
      `INSERT INTO clients (user_id, name, email, company, hourly_rate, currency)
       VALUES (?, 'Priya Mehta', 'priya@startup.io', 'StartupIO', 3000, 'INR')`,
      [uid]
    );

    // 3 Sample Projects
    const [p1] = await db.query(
      `INSERT INTO projects (user_id, client_id, name, description, status, billing_type, duration, budget, start_date, end_date, color)
       VALUES (?, ?, 'E-Commerce Website', 'Full-stack online store', 'active', 'hourly', '3 Months', 150000, '2024-01-01', '2024-03-31', '#4F46E5')`,
      [uid, c1.insertId]
    );
    const [p2] = await db.query(
      `INSERT INTO projects (user_id, client_id, name, description, status, billing_type, duration, budget, start_date, end_date, color)
       VALUES (?, ?, 'Mobile App MVP', 'React Native mobile app', 'active', 'hourly', '4 Months', 200000, '2024-02-01', '2024-05-31', '#7C3AED')`,
      [uid, c2.insertId]
    );
    const [p3] = await db.query(
      `INSERT INTO projects (user_id, client_id, name, description, status, billing_type, duration, budget, start_date, end_date, color)
       VALUES (?, ?, 'Brand Identity', 'Logo and brand guidelines', 'completed', 'fixed', '2 Months', 50000, '2023-11-01', '2024-01-15', '#0891B2')`,
      [uid, c1.insertId]
    );

    // 6 Sample Tasks
    const tasks = [
      [p1.insertId, uid, 'Design database schema', 'done',     'high',   10.0, '2024-01-15'],
      [p1.insertId, uid, 'Build product listing API', 'in_progress', 'high',  15.0, '2024-02-20'],
      [p1.insertId, uid, 'Payment gateway integration', 'todo','urgent', 20.0, '2024-03-10'],
      [p2.insertId, uid, 'User authentication', 'done',        'high',   8.0,  '2024-02-15'],
      [p2.insertId, uid, 'Dashboard screens', 'in_progress',   'medium', 25.0, '2024-03-20'],
      [p2.insertId, uid, 'Push notifications', 'todo',         'low',    12.0, '2024-05-01'],
    ];
    for (const t of tasks) {
      await db.query(
        'INSERT INTO tasks (project_id, user_id, title, status, priority, estimated_hours, due_date) VALUES (?,?,?,?,?,?,?)', t
      );
    }

    // 8 Sample Time Logs (completed, with historical dates)
    const rate = 2500;
    const logs = [
      [uid, p1.insertId, 'DB design and ERD',         '2024-01-10 09:00:00', '2024-01-10 13:00:00', rate, 1],
      [uid, p1.insertId, 'Backend API setup',         '2024-01-15 10:00:00', '2024-01-15 16:00:00', rate, 1],
      [uid, p1.insertId, 'Frontend React setup',      '2024-01-20 09:00:00', '2024-01-20 14:30:00', rate, 1],
      [uid, p2.insertId, 'Project planning',          '2024-02-01 11:00:00', '2024-02-01 13:00:00', 3000, 1],
      [uid, p2.insertId, 'Auth implementation',       '2024-02-10 09:00:00', '2024-02-10 17:00:00', 3000, 1],
      [uid, p3.insertId, 'Logo design concepts',      '2023-11-10 10:00:00', '2023-11-10 15:00:00', 2500, 1],
      [uid, p3.insertId, 'Brand guidelines doc',      '2023-12-05 09:00:00', '2023-12-05 14:00:00', 2500, 1],
      [uid, p1.insertId, 'Product listing page',      '2024-02-15 09:00:00', '2024-02-15 13:00:00', rate, 0],
    ];
    for (const [u,p,desc,st,et,hr,billed] of logs) {
      await db.query(
        'INSERT INTO time_logs (user_id, project_id, description, start_time, end_time, hourly_rate, is_billed, is_manual) VALUES (?,?,?,?,?,?,?,1)',
        [u, p, desc, st, et, hr, billed]
      );
    }

    // 2 Paid Invoices for charts
    const invNums = [`INV-SEED-001`, `INV-SEED-002`];
    await db.query(
      `INSERT INTO invoices (user_id, client_id, invoice_number, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total)
       VALUES (?, ?, ?, 'paid', '2024-01-31', '2024-02-28', 37500, 18, 6750, 44250)`,
      [uid, c1.insertId, invNums[0]]
    );
    await db.query(
      `INSERT INTO invoices (user_id, client_id, invoice_number, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total)
       VALUES (?, ?, ?, 'paid', '2024-02-28', '2024-03-31', 50000, 18, 9000, 59000)`,
      [uid, c2.insertId, invNums[1]]
    );

    res.json({ message: '✅ Sample data loaded successfully!' });
  } catch (err) { next(err); }
};

module.exports = { loadSampleData };
