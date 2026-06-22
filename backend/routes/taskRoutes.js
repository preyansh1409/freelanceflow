const router = require('express').Router();
const ctrl   = require('../controllers/taskController');
const auth   = require('../middleware/authMiddleware');

router.use(auth);
router.get('/',                       ctrl.getAllTasks);
router.get('/project/:projectId',     ctrl.getTasksByProject);
router.post('/',                      ctrl.createTask);
router.put('/:id',                    ctrl.updateTask);
router.delete('/:id',                 ctrl.deleteTask);

module.exports = router;
