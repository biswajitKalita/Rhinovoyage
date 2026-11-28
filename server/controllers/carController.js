const db = require('../config/db');
const { saveBase64Image } = require('../utils/upload');
const { syncCar } = require('../utils/sheets');

// @desc    Get All Cars
// @route   GET /api/cars
// @access  Private/Admin
exports.getCars = async (req, res) => {
  try {
    const cars = await db.find('cars');
    res.status(200).json({ success: true, count: cars.length, cars });
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving cars.' });
  }
};

// @desc    Register a Car
// @route   POST /api/cars
// @access  Private/Admin
exports.addCar = async (req, res) => {
  try {
    const { owner, ownerEmail, ownerPhone, modelName, plateNumber, category, rcPhoto, carImage, entryDate } = req.body;

    if (!owner || !modelName || !plateNumber || !category || !rcPhoto || !carImage) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields, including RC photo and car photo.' });
    }

    // Save uploaded files
    let savedRcPath = '';
    let savedCarImagePath = '';
    try {
      savedRcPath = saveBase64Image(rcPhoto, 'rc');
      savedCarImagePath = saveBase64Image(carImage, 'car');
    } catch (uploadErr) {
      return res.status(400).json({ success: false, message: uploadErr.message });
    }

    const newCar = await db.insert('cars', {
      owner,
      ownerEmail: ownerEmail || '',
      ownerPhone: ownerPhone || '',
      modelName,
      plateNumber,
      category,
      rcPhoto: savedRcPath,
      carImage: savedCarImagePath,
      entryDate: entryDate || new Date().toISOString().split('T')[0]
    });

    // Sync new vehicle to Google Sheet (Fleet Vehicles section)
    syncCar(newCar, 'Fleet Vehicle Added').catch(err => console.error('Car sheet sync error:', err));

    res.status(201).json({
      success: true,
      message: 'Car successfully registered in fleet.',
      car: newCar
    });
  } catch (error) {
    console.error('Add car error:', error);
    res.status(500).json({ success: false, message: 'Server error registering car.' });
  }
};

// @desc    Delete a Car
// @route   DELETE /api/cars/:id
// @access  Private/Admin
exports.deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    const exists = await db.findOne('cars', { id });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }

    await db.delete('cars', { id });

    // Sync vehicle deletion to Google Sheet (Fleet Vehicles section)
    syncCar(exists, 'Fleet Vehicle Deleted').catch(err => console.error('Car delete sheet sync error:', err));

    res.status(200).json({ success: true, message: 'Car successfully deleted from fleet.' });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting car.' });
  }
};

// @desc    Get Current Fleet Partner's Cars
// @route   GET /api/cars/my-fleet
// @access  Private (fleet / admin)
exports.getMyFleetCars = async (req, res) => {
  try {
    const user = req.user || {};
    if (!user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Partner profile not found.' });
    }

    let cars = [];
    if (user.role === 'admin') {
      cars = await db.find('cars');
    } else {
      const allCars = await db.find('cars');
      const userEmail = (user.email || '').toLowerCase().trim();
      const userPhone = (user.phone || '').trim();
      cars = allCars.filter(c => {
        const cEmail = (c.ownerEmail || '').toLowerCase().trim();
        const cPhone = (c.ownerPhone || '').trim();
        return (c.userId && c.userId === user.id) || 
               (userEmail && cEmail === userEmail) || 
               (userPhone && cPhone === userPhone);
      });
    }
    res.status(200).json({ success: true, count: cars.length, cars });
  } catch (error) {
    console.error('Get my fleet cars error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving fleet vehicles.' });
  }
};

// @desc    Attach a new car to Fleet Partner account
// @route   POST /api/cars/attach-vehicle
// @access  Private (fleet / admin)
exports.attachFleetCar = async (req, res) => {
  try {
    const { modelName, plateNumber, category, rcPhoto, carImage } = req.body;
    const user = req.user || {};
    if (!user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Partner profile not found.' });
    }

    if (!modelName || !plateNumber || !category || !rcPhoto) {
      return res.status(400).json({ success: false, message: 'Please provide model name, plate number, category, and RC photo.' });
    }

    const cleanPlate = plateNumber.toUpperCase().trim();
    const allCars = await db.find('cars');
    const existing = allCars.find(c => (c.plateNumber || '').toUpperCase().trim() === cleanPlate);
    if (existing) {
      return res.status(400).json({ success: false, message: `Vehicle with plate number ${cleanPlate} is already registered in the fleet.` });
    }

    let savedRcPath = '';
    let savedCarImagePath = '';
    try {
      savedRcPath = saveBase64Image(rcPhoto, 'rc');
      savedCarImagePath = carImage ? saveBase64Image(carImage, 'car') : savedRcPath;
    } catch (uploadErr) {
      return res.status(400).json({ success: false, message: uploadErr.message });
    }

    const newCar = await db.insert('cars', {
      owner: user.name || '',
      ownerEmail: (user.email || '').toLowerCase().trim(),
      ownerPhone: user.phone || '',
      userId: user.id,
      modelName: modelName.trim(),
      plateNumber: cleanPlate,
      category,
      rcPhoto: savedRcPath,
      carImage: savedCarImagePath,
      status: 'Pending',
      entryDate: new Date().toISOString().split('T')[0]
    });

    syncCar(newCar, 'Fleet Vehicle Attached by Partner').catch(err => console.error('Car sheet sync error:', err));

    res.status(201).json({
      success: true,
      message: 'Vehicle attached successfully and submitted for verification.',
      car: newCar
    });
  } catch (error) {
    console.error('Attach car error:', error);
    res.status(500).json({ success: false, message: 'Server error attaching vehicle.' });
  }
};
