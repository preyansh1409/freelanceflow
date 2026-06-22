const router = require('express').Router();
const ctrl   = require('../controllers/projectController');
const auth   = require('../middleware/authMiddleware');

router.use(auth);
router.get('/',     ctrl.getAllProjects);
router.get('/:id',  ctrl.getProjectById);
router.post('/',    ctrl.createProject);
router.put('/:id',  ctrl.updateProject);
router.delete('/:id', ctrl.deleteProject);

module.exports = router;
