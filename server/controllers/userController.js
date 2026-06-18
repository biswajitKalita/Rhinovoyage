const db = require('../config/db');
const { syncUserLog } = require('../utils/sheets');
const { saveBase64Image } = require('../utils/upload');
const bcrypt = require('bcryptjs');

// @desc    Get All Drivers
// @route   GET /api/users/drivers
// @access  Private/Admin
exports.getDrivers = (req, res) => {
  try {
    const drivers = db.find('users', { role: 'driver' });
    res.status(200).json({ success: true, count: drivers.length, drivers });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving drivers.' });
  }
};

// @desc    Verify Driver Status
// @route   PUT /api/users/drivers/:id/verify
// @access  Private/Admin
exports.verifyDriver = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Approved', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid verification status: Approved or Rejected.' });
    }

    const driver = db.findOne('users', { id, role: 'driver' });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    // Update status
    db.update('users', { id }, { verificationStatus: status });

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
    const existingUser = db.findOne('users', { email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
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
    const newDriver = db.insert('users', {
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
