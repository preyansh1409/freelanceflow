const router = require('express').Router();
const ctrl   = require('../controllers/clientController');
const auth   = require('../middleware/authMiddleware');
const { checkFreemiumLimit } = require('../middleware/tierMiddleware');

router.use(auth);
router.get('/',    ctrl.getAllClients);
router.get('/:id', ctrl.getClientById);
router.post('/',   checkFreemiumLimit, ctrl.createClient);
router.put('/:id', ctrl.updateClient);
router.delete('/:id', ctrl.deleteClient);

module.exports = router;
