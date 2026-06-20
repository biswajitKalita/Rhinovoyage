const express = require('express');
const { getCars, addCar, deleteCar } = require('../controllers/carController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorize('admin'), getCars);
router.post('/', protect, authorize('admin'), addCar);
router.delete('/:id', protect, authorize('admin'), deleteCar);

module.exports = router;
