const generateInvoiceNumber = async (userId, db) => {
  const year = new Date().getFullYear();
  const [[{ count }]] = await db.query(
    'SELECT COUNT(*) AS count FROM invoices WHERE user_id = ? AND YEAR(created_at) = ?',
    [userId, year]
  );
  const seq = String(count + 1).padStart(4, '0');
  return `INV-${year}-${seq}`;
};

module.exports = { generateInvoiceNumber };
