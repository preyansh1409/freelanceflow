const mysql = require('mysql2');
require('dotenv').config();

const sslConfig = (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1')
  ? { rejectUnauthorized: false, minVersion: 'TLSv1.2' }
  : undefined;

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'freelanceflow',
  ssl:      sslConfig,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// Test connection on startup (gracefully log failure if XAMPP is not running)
pool.getConnection((err, conn) => {
  if (err) {
    console.warn('⚠️ MySQL connection failed (will retry/connect later):', err.message);
    return;
  }
  console.log('✅ MySQL connected');
  
  // Alter table to add expertise column if it doesn't exist
  conn.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'expertise'
  `, (colErr, rows) => {
    if (!colErr && rows.length === 0) {
      conn.query("ALTER TABLE users ADD COLUMN expertise VARCHAR(500) DEFAULT NULL", (alterErr) => {
        if (!alterErr) {
          console.log("✅ Added expertise column to users table");
        } else {
          console.warn("⚠️ Failed to add expertise column:", alterErr.message);
        }
      });
    }
  });

  conn.release();
});

module.exports = pool.promise(); // Use promise-based API
