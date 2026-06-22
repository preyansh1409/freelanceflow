const router = require('express').Router();
const { register, login, getMe, updateProfile, updatePassword, deleteAccount } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        auth, getMe);
router.put('/profile',   auth, updateProfile);
router.put('/password',  auth, updatePassword);
router.delete('/account',auth, deleteAccount);

module.exports = router;
