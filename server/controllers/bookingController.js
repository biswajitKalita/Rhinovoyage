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

    const validStatuses = ['Pending', 'Approved', 'Completed', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status: Pending, Approved, Completed, or Cancelled.' });
    }

    const exists = db.findOne('bookings', { id });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const updateFields = { status };

    // If marked Completed, generate invoice details if not already generated
    if (status === 'Completed' && !exists.invoice) {
      const invoiceData = createInvoiceObject(exists, req.body.invoiceDetails || {});
      updateFields.invoice = invoiceData;
      updateFields.totalAmount = invoiceData.totalAmount;
      updateFields.completedAt = new Date().toISOString();
    }

    db.update('bookings', { id }, updateFields);
    const updatedBooking = { ...exists, ...updateFields };

    // Sync booking status update to Google Sheet
    syncBooking(updatedBooking, 'update_status').catch(err => console.error('Booking status update sheet sync error:', err));

    // Create notification if the booking belongs to an active user account
    if (exists.userId && exists.userId !== 'guest') {
      let notifyMessage = '';
      const dateStr = new Date(exists.pickupDate).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });

      if (status === 'Approved') {
        notifyMessage = `Your trip request for ${exists.vehicle} on ${dateStr} has been confirmed! 🎉`;
      } else if (status === 'Completed') {
        const amt = updatedBooking.totalAmount ? `₹${Number(updatedBooking.totalAmount).toLocaleString('en-IN')}` : 'available';
        notifyMessage = `Your journey for ${exists.vehicle} on ${dateStr} is completed! 🎉 Your invoice for ${amt} is ready to view and download. 🧾`;
      } else if (status === 'Cancelled') {
        notifyMessage = `Your trip request for ${exists.vehicle} on ${dateStr} has been cancelled. Please contact support. ⚠️`;
      }

      if (notifyMessage) {
        db.insert('notifications', {
          userId: exists.userId,
          message: notifyMessage,
          read: false,
          bookingId: id,
          type: status === 'Completed' ? 'invoice' : 'status'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status} successfully.`,
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating booking status.' });
  }
};

// Helper to calculate and generate structured invoice data (GST removed as requested)
function createInvoiceObject(booking, custom = {}) {
  // Estimate standard base fare based on vehicle or service if not supplied
  let defaultBase = 3500;
  const v = (booking.vehicle || '').toLowerCase();
  if (v.includes('sedan')) defaultBase = 2800;
  else if (v.includes('suv') || v.includes('muv') || v.includes('innova')) defaultBase = 4500;
  else if (v.includes('luxury') || v.includes('fortuner')) defaultBase = 8500;
  else if (v.includes('bus') || v.includes('tempo')) defaultBase = 12000;
  else if (booking.serviceType === 'tour_package') defaultBase = 16500;

  const baseFare = custom.baseAmount !== undefined && custom.baseAmount !== '' ? Number(custom.baseAmount) : (booking.baseAmount || defaultBase);
  const extraKms = Number(custom.extraKms || 0);
  const extraKmRate = Number(custom.extraKmRate || 14);
  const extraKmCharges = Number(custom.extraKmCharges !== undefined ? custom.extraKmCharges : (extraKms * extraKmRate));
  const tollCharges = Number(custom.tollCharges || 0);
  const parkingCharges = Number(custom.parkingCharges || 0);
  const discount = Number(custom.discount || 0);

  const subtotal = Math.max(0, baseFare + extraKmCharges + tollCharges + parkingCharges - discount);
  const gstRate = 0; // GST not applied
  const cgst = 0;
  const sgst = 0;
  const gstAmount = 0;
  const totalAmount = Math.round(subtotal);

  const issueDate = new Date().toISOString();
  const invoiceNumber = custom.invoiceNumber || booking.invoiceNumber || `RV-INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    invoiceNumber,
    issueDate,
    tripDate: booking.pickupDate,
    completedAt: issueDate,
    paymentMethod: custom.paymentMethod || booking.paymentMethod || 'UPI / Cash',
    paymentStatus: custom.paymentStatus || 'Paid',
    distanceKm: custom.distanceKm || `${extraKms > 0 ? extraKms + 100 : 'Standard'} km`,
    baseFare,
    extraKmCharges,
    tollCharges,
    parkingCharges,
    discount,
    subtotal,
    gstRate,
    cgst,
    sgst,
    gstAmount,
    totalAmount,
    notes: custom.notes || 'Thank you for traveling with RhinoVoyage!'
  };
}

// @desc    Complete Booking Journey & Generate Invoice
// @route   PUT /api/bookings/:id/complete
// @access  Private (Admin or Assigned Driver)
exports.completeBooking = (req, res) => {
  try {
    const { id } = req.params;
    const booking = db.findOne('bookings', { id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Role verification: Admin or the assigned Driver
    if (req.user.role !== 'admin' && (req.user.role !== 'driver' || booking.driverId !== req.user.id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to complete this trip.' });
    }

    const invoiceData = createInvoiceObject(booking, req.body);
    const completedAt = new Date().toISOString();

    const updateData = {
      status: 'Completed',
      completedAt,
      invoice: invoiceData,
      totalAmount: invoiceData.totalAmount,
      invoiceNumber: invoiceData.invoiceNumber
    };

    db.update('bookings', { id }, updateData);
    const updatedBooking = { ...booking, ...updateData };

    // Sync to Google Sheet
    syncBooking(updatedBooking, 'complete_journey').catch(err => console.error('Complete booking sheet sync error:', err));

    // Send notification to customer
    if (booking.userId && booking.userId !== 'guest') {
      const dateStr = new Date(booking.pickupDate).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
      db.insert('notifications', {
        userId: booking.userId,
        message: `Your journey with ${booking.vehicle} on ${dateStr} is completed! 🎉 Invoice #${invoiceData.invoiceNumber} for ₹${invoiceData.totalAmount.toLocaleString('en-IN')} is ready. 🧾`,
        read: false,
        bookingId: id,
        type: 'invoice'
      });
    }

    // If completed by driver, notify admin / driver confirmation
    res.status(200).json({
      success: true,
      message: 'Journey marked as Completed and Invoice generated successfully!',
      booking: updatedBooking,
      invoice: invoiceData
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ success: false, message: 'Server error completing booking.' });
  }
};

// @desc    Get Booking Invoice Details
// @route   GET /api/bookings/:id/invoice
// @access  Public / Private (Booking owner, assigned driver, admin, or valid bookingId)
exports.getBookingInvoice = (req, res) => {
  try {
    let { id } = req.params;
    let booking = null;

    if (!id || id === 'latest' || id === 'undefined') {
      if (req.user) {
        const userBookings = db.find('bookings', { userId: req.user.id });
        if (userBookings.length > 0) {
          userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          booking = userBookings[0];
        }
      }
      if (!booking) {
        const allBookings = db.find('bookings');
        if (allBookings.length > 0) {
          allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          booking = allBookings[0];
        }
      }
    } else {
      booking = db.findOne('bookings', { id });
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Permission check if user is authenticated
    if (req.user) {
      if (req.user.role === 'user' && booking.userId !== req.user.id && booking.userId !== 'guest') {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this invoice.' });
      }
      if (req.user.role === 'driver' && booking.driverId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this trip invoice.' });
      }
    }

    // If invoice not present, generate auto-invoice on the fly without GST
    let invoice = booking.invoice;
    if (!invoice) {
      invoice = createInvoiceObject(booking, {});
    } else {
      // Ensure gst is 0 even if older cached invoice
      invoice.gstRate = 0;
      invoice.cgst = 0;
      invoice.sgst = 0;
      invoice.gstAmount = 0;
      invoice.totalAmount = invoice.subtotal || invoice.totalAmount;
    }

    // Fetch user details for richer invoice if available
    let customerUser = null;
    if (booking.userId && booking.userId !== 'guest') {
      const u = db.findOne('users', { id: booking.userId });
      if (u) {
        customerUser = {
          name: u.name,
          email: u.email,
          phone: u.phone
        };
      }
    }

    const companyDetails = {
      name: 'RhinoVoyage',
      tagline: 'Premier Assam & Northeast Travel Experience',
      address: 'LKB Road, Amulapatty, Sivasagar, Assam — 785640, India',
      phone: '+91 98648 20229, +91 99542 53585',
      email: 'rhinovoyage@gmail.com',
      website: 'www.rhinovoyage.com'
    };

    res.status(200).json({
      success: true,
      booking,
      invoice,
      customerUser,
      company: companyDetails
    });
  } catch (error) {
    console.error('Get booking invoice error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving invoice.' });
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
