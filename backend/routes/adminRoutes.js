const express = require('express');
const router  = express.Router();
const { getUsersData, updateUserData, deleteUserData } = require('../controllers/adminController');

router.get('/users', getUsersData);
router.put('/users/:id', updateUserData);
router.delete('/users/:id', deleteUserData);

module.exports = router;

