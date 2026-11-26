const db = require('../config/db');
const { syncUserLog } = require('../utils/sheets');
const { saveBase64Image } = require('../utils/upload');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// @desc    Get All Drivers
// @route   GET /api/users/drivers
// @access  Private/Admin
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await db.find('users', { role: 'driver' });
    res.status(200).json({ success: true, count: drivers.length, drivers });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving drivers.' });
  }
};

// @desc    Verify Driver Status
// @route   PUT /api/users/drivers/:id/verify
// @access  Private/Admin
exports.verifyDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Approved', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid verification status: Approved or Rejected.' });
    }

    const driver = await db.findOne('users', { id, role: 'driver' });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    // Update status
    await db.update('users', { id }, { verificationStatus: status });

    // Sync status change to Google Sheet
    const updatedDriver = { ...driver, verificationStatus: status };
    syncUserLog(updatedDriver, `verify_${status.toLowerCase()}`).catch(err => console.error('Driver verify sheet sync error:', err));

    res.status(200).json({
      success: true,
      message: `Driver status successfully updated to ${status}.`,
      driver: { id, name: driver.name, email: driver.email, role: 'driver', verificationStatus: status }
    });
  } catch (error) {
    console.error('Verify driver error:', error);
    res.status(500).json({ success: false, message: 'Server error updating driver verification.' });
  }
};

// @desc    Admin Add Driver
// @route   POST /api/users/drivers
// @access  Private/Admin
exports.adminAddDriver = async (req, res) => {
  try {
    const { name, email, password, phone, aadhar, license, aadharPhoto, licensePhoto } = req.body;

    if (!name || !email || !password || !phone || !aadhar || !license || !aadharPhoto || !licensePhoto) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields, including Aadhar and License documents.' });
    }

    // Check if email already exists
    const existingUser = await db.findOne('users', { email: email.toLowerCase() });
    if (existingUser) {
      if (existingUser.role === 'admin') {
        return res.status(400).json({ success: false, message: 'Cannot convert administrator account to driver.' });
      }
      if (existingUser.role === 'driver') {
        return res.status(400).json({ success: false, message: 'A driver account with this email address already exists.' });
      }

      // Upgrade existing customer account to verified Driver Partner
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      let savedAadharPath = '';
      let savedLicensePath = '';
      try {
        savedAadharPath = saveBase64Image(aadharPhoto, 'aadhar');
        savedLicensePath = saveBase64Image(licensePhoto, 'license');
      } catch (uploadErr) {
        return res.status(400).json({ success: false, message: uploadErr.message });
      }

      await db.update('users', { id: existingUser.id }, {
        name,
        password: hashedPassword,
        phone,
        role: 'driver',
        aadhar,
        license,
        aadharPhoto: savedAadharPath,
        licensePhoto: savedLicensePath,
        verificationStatus: 'Approved'
      });

      const updatedDriver = {
        ...existingUser,
        name,
        phone,
        role: 'driver',
        aadhar,
        license,
        aadharPhoto: savedAadharPath,
        licensePhoto: savedLicensePath,
        verificationStatus: 'Approved'
      };
      syncUserLog(updatedDriver, 'upgrade_driver').catch(err => console.error('Admin add driver sheets sync error:', err));

      return res.status(200).json({
        success: true,
        message: 'Existing user account upgraded to Driver Partner and approved successfully! 🎉',
        driver: {
          id: existingUser.id,
          name,
          email: existingUser.email,
          phone,
          role: 'driver',
          aadhar,
          license,
          aadharPhoto: savedAadharPath,
          licensePhoto: savedLicensePath,
          verificationStatus: 'Approved'
        }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save uploaded files
    let savedAadharPath = '';
    let savedLicensePath = '';
    try {
      savedAadharPath = saveBase64Image(aadharPhoto, 'aadhar');
      savedLicensePath = saveBase64Image(licensePhoto, 'license');
    } catch (uploadErr) {
      return res.status(400).json({ success: false, message: uploadErr.message });
    }

    // Insert driver
    const newDriver = await db.insert('users', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: 'driver',
      aadhar,
      license,
      aadharPhoto: savedAadharPath,
      licensePhoto: savedLicensePath,
      verificationStatus: 'Approved' // Pre-approved when created by admin
    });

    // Sync registration log to Google Sheets
    syncUserLog(newDriver, 'register').catch(err => console.error('Admin add driver sheets sync error:', err));

    res.status(201).json({
      success: true,
      message: 'Driver partner successfully created and approved.',
      driver: {
        id: newDriver.id,
        name: newDriver.name,
        email: newDriver.email,
        phone: newDriver.phone,
        role: 'driver',
        aadhar: newDriver.aadhar,
        license: newDriver.license,
        aadharPhoto: newDriver.aadharPhoto,
        licensePhoto: newDriver.licensePhoto,
        verificationStatus: 'Approved'
      }
    });
  } catch (error) {
    console.error('Admin add driver error:', error);
    res.status(500).json({ success: false, message: 'Server error creating driver partner.' });
  }
};

// @desc    Delete Driver Partner
// @route   DELETE /api/users/drivers/:id
// @access  Private/Admin
exports.deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = {
        role: 'driver',
        $or: [{ id: id }, { _id: new mongoose.Types.ObjectId(id) }]
      };
    } else {
      query = { role: 'driver', id: id };
    }

    const driver = await db.findOne('users', query);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver partner not found.' });
    }

    const driverId = driver.id || id;

    // Unassign driver from any bookings
    await db.update('bookings', { driverId: driverId }, { driverId: '', driverName: '' });

    // Delete driver from users database
    if (driver._id) {
      await db.delete('users', { _id: driver._id });
    } else {
      await db.delete('users', { id: driverId, role: 'driver' });
    }

    // Clean up uploaded documents if they exist
    const uploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../client/public/uploads');
    [driver.aadharPhoto, driver.licensePhoto].forEach(photoPath => {
      if (photoPath) {
        try {
          const filename = path.basename(photoPath);
          const fullPath = path.join(uploadDir, filename);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (e) {
          // ignore error removing file
        }
      }
    });

    // Sync deletion log to Google Sheets
    syncUserLog(driver, 'delete_driver').catch(err => console.error('Driver delete sheet sync error:', err));

    res.status(200).json({
      success: true,
      message: `Driver partner "${driver.name}" successfully deleted.`
    });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting driver partner.' });
  }
};

// @desc    Update User Profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    await db.update('users', { id: userId }, updateData);
    const updated = await db.findOne('users', { id: userId });
    res.status(200).json({ success: true, message: 'Profile updated successfully.', user: updated });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};
