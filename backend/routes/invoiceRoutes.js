const router = require('express').Router();
const ctrl   = require('../controllers/invoiceController');
const auth   = require('../middleware/authMiddleware');

router.use(auth);
router.get('/',              ctrl.getAllInvoices);
router.get('/:id',           ctrl.getInvoiceById);
router.post('/',             ctrl.createInvoice);
router.post('/draft',        ctrl.createDraftInvoice);
router.patch('/:id/status',  ctrl.updateInvoiceStatus);
router.delete('/:id',        ctrl.deleteInvoice);

module.exports = router;
