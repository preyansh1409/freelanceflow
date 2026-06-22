const router = require('express').Router();
const ctrl   = require('../controllers/timeLogController');
const auth   = require('../middleware/authMiddleware');

router.use(auth);
router.get('/',                       ctrl.getAllLogs);
router.get('/running',                ctrl.getRunningTimer);
router.get('/project/:projectId',     ctrl.getLogsByProject);
router.post('/start',                 ctrl.startTimer);
router.post('/stop',                  ctrl.stopTimer);
router.post('/manual',                ctrl.addManualEntry);
router.delete('/:id',                 ctrl.deleteLog);

module.exports = router;
