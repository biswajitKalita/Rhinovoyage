const db = require('../config/db');
const { syncBooking } = require('../utils/sheets');

// @desc    Create Booking
// @route   POST /api/bookings
// @access  Public (guests can book, but authenticated users' bookings are linked to their account)
exports.createBooking = (req, res) => {
  try {
    const { serviceType, name, phone, pickupDate, vehicle, details, paymentMethod } = req.body;

    if (!serviceType || !name || !phone || !pickupDate || !vehicle || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Please provide all required booking fields.' });
    }

    const bookingData = {
      serviceType,
      name,
      phone,
      pickupDate,
      vehicle,
      details: details || '',
      paymentMethod,
      status: 'Pending',
      userId: req.user ? req.user.id : 'guest' // link to user if logged in
    };

    const newBooking = db.insert('bookings', bookingData);

    // Sync booking creation to Google Sheet
    syncBooking(newBooking, 'create').catch(err => console.error('Booking create sheet sync error:', err));

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully!',
      booking: newBooking
    });
  } catch (error) {
    console.error('Create booking controller error:', error);
    res.status(500).json({ success: false, message: 'Server error during booking creation.' });
  }
};

// @desc    Get Current User's Bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getUserBookings = (req, res) => {
  try {
    if (req.user.role === 'driver') {
      if (req.user.verificationStatus !== 'Approved') {
        return res.status(403).json({
          success: false,
          message: 'Your driver account has not been approved yet. Please wait for administrator verification.'
        });
      }
      const bookings = db.find('bookings', { driverId: req.user.id });
      return res.status(200).json({ success: true, count: bookings.length, bookings });
    }

    const bookings = db.find('bookings', { userId: req.user.id });
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving bookings.' });
  }
};

// @desc    Get All Bookings
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = (req, res) => {
  try {
    const bookings = db.find('bookings'); // empty query returns all
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving all bookings.' });
  }
};

// @desc    Update Booking Status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['Pending', 'Approved', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status: Pending, Approved, or Cancelled.' });
    }

    const exists = db.findOne('bookings', { id });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    db.update('bookings', { id }, { status });

    // Sync booking status update to Google Sheet
    syncBooking({ ...exists, status }, 'update_status').catch(err => console.error('Booking status update sheet sync error:', err));

    // Create notification if the booking belongs to an active user account
    if (exists.userId && exists.userId !== 'guest') {
      let notifyMessage = '';
      const dateStr = new Date(exists.pickupDate).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });

      if (status === 'Approved') {
        notifyMessage = `Your trip request for ${exists.vehicle} on ${dateStr} has been confirmed! 🎉`;
      } else if (status === 'Cancelled') {
        notifyMessage = `Your trip request for ${exists.vehicle} on ${dateStr} has been cancelled. Please contact support. ⚠️`;
      }

      if (notifyMessage) {
        db.insert('notifications', {
          userId: exists.userId,
          message: notifyMessage,
          read: false
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status} successfully.`,
      booking: { ...exists, status }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating booking status.' });
  }
};

// @desc    Delete Booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
exports.deleteBooking = (req, res) => {
  try {
    const { id } = req.params;

    const exists = db.findOne('bookings', { id });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Sync booking deletion to Google Sheet
    syncBooking(exists, 'delete').catch(err => console.error('Booking delete sheet sync error:', err));

    db.delete('bookings', { id });

    res.status(200).json({ success: true, message: 'Booking deleted successfully.' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting booking.' });
  }
};

// @desc    Assign Driver to Booking
// @route   PUT /api/bookings/:id/assign-driver
// @access  Private/Admin
exports.assignDriver = (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    const booking = db.findOne('bookings', { id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    let driverName = '';
    if (driverId) {
      const driver = db.findOne('users', { id: driverId, role: 'driver' });
      if (!driver) {
        return res.status(404).json({ success: false, message: 'Driver not found.' });
      }
      if (driver.verificationStatus !== 'Approved') {
        return res.status(400).json({ success: false, message: 'Cannot assign an unverified or rejected driver.' });
      }
      driverName = driver.name;
    }

    // Update booking in DB
    db.update('bookings', { id }, { driverId: driverId || '', driverName });

    const updatedBooking = { ...booking, driverId: driverId || '', driverName };

    // Sync booking status/assignment update to Google Sheet
    syncBooking(updatedBooking, 'assign_driver').catch(err => console.error('Booking driver update sheet sync error:', err));

    // Create notification for the driver if one was assigned
    if (driverId) {
      const dateStr = new Date(booking.pickupDate).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
      db.insert('notifications', {
        userId: driverId,
        message: `New trip assigned to you for ${booking.vehicle} on ${dateStr}. 🚗`,
        read: false
      });
    }

    res.status(200).json({
      success: true,
      message: driverId ? `Driver ${driverName} successfully assigned.` : 'Driver unassigned successfully.',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Assign driver error:', error);
    res.status(500).json({ success: false, message: 'Server error assigning driver.' });
  }
};

// @desc    Assign Car to Booking
// @route   PUT /api/bookings/:id/assign-car
// @access  Private/Admin
exports.assignCar = (req, res) => {
  try {
    const { id } = req.params;
    const { carId } = req.body;

    const booking = db.findOne('bookings', { id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    let carModel = '';
    let carNumber = '';
    if (carId) {
      const car = db.findOne('cars', { id: carId });
      if (!car) {
        return res.status(404).json({ success: false, message: 'Car not found.' });
      }
      carModel = car.modelName;
      carNumber = car.plateNumber;
    }

    // Update booking in DB
    db.update('bookings', { id }, { carId: carId || '', carModel, carNumber });

    const updatedBooking = { ...booking, carId: carId || '', carModel, carNumber };

    // Sync booking status/assignment update to Google Sheet
    syncBooking(updatedBooking, 'assign_car').catch(err => console.error('Booking car update sheet sync error:', err));

    res.status(200).json({
      success: true,
      message: carId ? `Car ${carModel} (${carNumber}) successfully assigned.` : 'Car unassigned successfully.',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Assign car error:', error);
    res.status(500).json({ success: false, message: 'Server error assigning car.' });
  }
};
