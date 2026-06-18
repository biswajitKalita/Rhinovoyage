const express = require('express');
const { getDrivers, verifyDriver, adminAddDriver } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/drivers', protect, authorize('admin'), getDrivers);
router.post('/drivers', protect, authorize('admin'), adminAddDriver);
router.put('/drivers/:id/verify', protect, authorize('admin'), verifyDriver);

module.exports = router;
