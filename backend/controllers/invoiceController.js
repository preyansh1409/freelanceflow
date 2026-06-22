const db = require('../config/db');
const { generateInvoiceNumber } = require('../utils/invoiceNumber');

// Create invoice from unbilled logs
const createInvoice = async (req, res, next) => {
  try {
    const { client_id, time_log_ids, due_date, tax_rate, notes } = req.body;

    if (!client_id || !due_date) {
      return res.status(400).json({ message: 'Client and due date are required' });
    }

    if (!time_log_ids || time_log_ids.length === 0) {
      return res.status(400).json({ message: 'Select at least one time log' });
    }

    // Validate all logs belong to user + client + are unbilled
    const placeholders = time_log_ids.map(() => '?').join(',');
    const [logs] = await db.query(
      `SELECT tl.*, p.name AS project_name FROM time_logs tl
       JOIN projects p ON p.id = tl.project_id
       WHERE tl.id IN (${placeholders})
         AND tl.user_id = ?
         AND p.client_id = ?
         AND tl.is_billed = 0
         AND tl.end_time IS NOT NULL`,
      [...time_log_ids, req.user.id, client_id]
    );

    if (logs.length !== time_log_ids.length) {
      return res.status(400).json({ message: 'Some logs are invalid or already billed' });
    }

    const subtotal   = logs.reduce((sum, l) => sum + parseFloat(l.amount || 0), 0);
    const tax        = (subtotal * (tax_rate || 18)) / 100;
    const total      = subtotal + tax;
    const invoiceNum = await generateInvoiceNumber(req.user.id, db);

    const [inv] = await db.query(
      `INSERT INTO invoices (user_id, client_id, invoice_number, issue_date, due_date, subtotal, tax_rate, tax_amount, total, notes)
       VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?)`,
      [req.user.id, client_id, invoiceNum, due_date, subtotal, tax_rate || 18, tax, total, notes || null]
    );

    // Insert invoice items
    for (const log of logs) {
      const hours = (log.duration_minutes || 0) / 60;
      await db.query(
        'INSERT INTO invoice_items (invoice_id, time_log_id, description, hours, rate, amount) VALUES (?,?,?,?,?,?)',
        [inv.insertId, log.id, log.project_name || log.description || 'Development work', hours.toFixed(2), log.hourly_rate, log.amount]
      );
    }

    // Mark logs as billed
    await db.query(
      `UPDATE time_logs SET is_billed = 1 WHERE id IN (${placeholders})`,
      time_log_ids
    );

    const [created] = await db.query('SELECT * FROM invoices WHERE id = ?', [inv.insertId]);
    res.status(201).json(created[0]);
  } catch (err) { next(err); }
};

const getAllInvoices = async (req, res, next) => {
  try {
    const [invoices] = await db.query(
      `SELECT i.*, c.name AS client_name, c.company AS client_company
       FROM invoices i JOIN clients c ON c.id = i.client_id
       WHERE i.user_id = ?
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    res.json(invoices);
  } catch (err) { next(err); }
};

const getInvoiceById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT i.*, c.name AS client_name, c.email AS client_email, c.phone AS client_phone,
              c.company AS client_company, c.address AS client_address, c.currency
       FROM invoices i JOIN clients c ON c.id = i.client_id
       WHERE i.id = ? AND i.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Invoice not found' });

    const [items] = await db.query(
      `SELECT ii.*, p.name AS project_name
       FROM invoice_items ii
       LEFT JOIN time_logs tl ON tl.id = ii.time_log_id
       LEFT JOIN projects p ON p.id = tl.project_id
       WHERE ii.invoice_id = ?`,
      [req.params.id]
    );
    res.json({ ...rows[0], items });
  } catch (err) { next(err); }
};

const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });

    const [result] = await db.query(
      'UPDATE invoices SET status = ? WHERE id = ? AND user_id = ?',
      [status, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Status updated', status });
  } catch (err) { next(err); }
};

const deleteInvoice = async (req, res, next) => {
  try {
    // Un-bill the time logs associated with this invoice
    await db.query(
      `UPDATE time_logs SET is_billed = 0
       WHERE id IN (SELECT time_log_id FROM invoice_items WHERE invoice_id = ?)`,
      [req.params.id]
    );
    await db.query('DELETE FROM invoices WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Invoice deleted' });
  } catch (err) { next(err); }
};

// Create a pending draft invoice for a client (no time logs required)
const createDraftInvoice = async (req, res, next) => {
  try {
    const { client_id, notes } = req.body;
    if (!client_id) return res.status(400).json({ message: 'client_id is required' });

    // Fetch client details
    const [clients] = await db.query('SELECT * FROM clients WHERE id = ? AND user_id = ?', [client_id, req.user.id]);
    if (clients.length === 0) return res.status(404).json({ message: 'Client not found' });
    const client = clients[0];

    const subtotal = parseFloat(client.hourly_rate || 0);
    const taxRate = 18;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().substring(0, 10);

    const invoiceNum = await generateInvoiceNumber(req.user.id, db);

    const [inv] = await db.query(
      `INSERT INTO invoices (user_id, client_id, invoice_number, issue_date, due_date, subtotal, tax_rate, tax_amount, total, status, notes)
       VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, 'draft', ?)`,
      [req.user.id, client_id, invoiceNum, dueDateStr, subtotal, taxRate, taxAmount, total, notes || 'Auto-generated invoice']
    );

    // Insert auto-generated invoice item linked to the client's project
    await db.query(
      'INSERT INTO invoice_items (invoice_id, time_log_id, description, hours, rate, amount) VALUES (?, NULL, ?, 1, ?, ?)',
      [inv.insertId, client.company || client.name || 'Project Development', subtotal, subtotal]
    );

    const [created] = await db.query(
      `SELECT i.*, c.name AS client_name, c.company AS client_company
       FROM invoices i JOIN clients c ON c.id = i.client_id
       WHERE i.id = ?`,
      [inv.insertId]
    );
    res.status(201).json(created[0]);
  } catch (err) { next(err); }
};

module.exports = { createInvoice, createDraftInvoice, getAllInvoices, getInvoiceById, updateInvoiceStatus, deleteInvoice };
