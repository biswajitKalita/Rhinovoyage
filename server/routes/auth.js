const express = require('express');
const { register, login, logout, getMe, googleSignIn, getGoogleClientId } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleSignIn);
router.get('/google-client-id', getGoogleClientId);
router.get('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
