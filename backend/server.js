const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
require('dotenv').config();

const app = express();

// ── Middleware ────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) || 
      origin.endsWith('.vercel.app') || 
      (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)
    ) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed for this origin'), false);
  },
  credentials: true 
}));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/clients',    require('./routes/clientRoutes'));
app.use('/api/projects',   require('./routes/projectRoutes'));
app.use('/api/tasks',      require('./routes/taskRoutes'));
app.use('/api/timelogs',   require('./routes/timeLogRoutes'));
app.use('/api/invoices',   require('./routes/invoiceRoutes'));
app.use('/api/dashboard',  require('./routes/dashboardRoutes'));
app.use('/api/seed',       require('./routes/seederRoutes'));
app.use('/api/admin',      require('./routes/adminRoutes'));

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const { runMigrations } = require('./utils/migrate');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await runMigrations();
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server due to migration/database error:', err);
    process.exit(1);
  }
})();

module.exports = app; // Export for testing
