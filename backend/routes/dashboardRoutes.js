const router = require('express').Router();
const ctrl   = require('../controllers/dashboardController');
const auth   = require('../middleware/authMiddleware');

router.use(auth);
router.get('/stats',           ctrl.getStats);
router.get('/revenue-chart',   ctrl.getRevenueChart);
router.get('/project-status',  ctrl.getProjectStatusChart);

module.exports = router;
