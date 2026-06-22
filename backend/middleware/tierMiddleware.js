const db = require('../config/db');

// Blocks free-plan users from adding more than 2 clients
const checkFreemiumLimit = async (req, res, next) => {
  try {
    if (req.user.plan === 'pro') return next(); // Pro users: no limit

    const [rows] = await db.query(
      'SELECT COUNT(*) AS total FROM clients WHERE user_id = ?',
      [req.user.id]
    );
    if (rows[0].total >= 2) {
      return res.status(403).json({
        message: 'Free plan allows max 2 clients. Upgrade to Pro for unlimited.',
        upgradeRequired: true,
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { checkFreemiumLimit };
