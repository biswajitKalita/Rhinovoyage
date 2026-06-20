const express = require('express');
const { 
  createBooking, 
  getUserBookings, 
  getAllBookings, 
  updateBookingStatus, 
  deleteBooking,
  assignDriver,
  assignCar
} = require('../controllers/bookingController');
const { protect, authorize, optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', optionalProtect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.get('/', protect, authorize('admin'), getAllBookings);
router.put('/:id/status', protect, authorize('admin'), updateBookingStatus);
router.put('/:id/assign-driver', protect, authorize('admin'), assignDriver);
router.put('/:id/assign-car', protect, authorize('admin'), assignCar);
router.delete('/:id', protect, authorize('admin'), deleteBooking);

module.exports = router;
