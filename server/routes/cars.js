const express = require('express');
const { getCars, addCar, deleteCar, getMyFleetCars, attachFleetCar } = require('../controllers/carController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-fleet', protect, authorize('fleet', 'admin'), getMyFleetCars);
router.post('/attach-vehicle', protect, authorize('fleet', 'admin'), attachFleetCar);

router.get('/', protect, authorize('admin'), getCars);
router.post('/', protect, authorize('admin'), addCar);
router.delete('/:id', protect, authorize('admin'), deleteCar);

module.exports = router;
