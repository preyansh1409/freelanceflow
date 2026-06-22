const router = require('express').Router();
const { loadSampleData } = require('../controllers/seederController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, loadSampleData);

module.exports = router;
