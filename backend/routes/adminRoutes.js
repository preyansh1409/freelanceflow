const express = require('express');
const router  = express.Router();
const { getUsersData } = require('../controllers/adminController');

router.get('/users', getUsersData);

module.exports = router;
