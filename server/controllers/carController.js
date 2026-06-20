const db = require('../config/db');
const { saveBase64Image } = require('../utils/upload');

// @desc    Get All Cars
// @route   GET /api/cars
// @access  Private/Admin
exports.getCars = (req, res) => {
  try {
    const cars = db.find('cars');
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
    const { owner, modelName, plateNumber, category, rcPhoto, carImage, entryDate } = req.body;

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

    const newCar = db.insert('cars', {
      owner,
      modelName,
      plateNumber,
      category,
      rcPhoto: savedRcPath,
      carImage: savedCarImagePath,
      entryDate: entryDate || new Date().toISOString().split('T')[0]
    });

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
exports.deleteCar = (req, res) => {
  try {
    const { id } = req.params;

    const exists = db.findOne('cars', { id });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }

    db.delete('cars', { id });

    res.status(200).json({ success: true, message: 'Car successfully deleted from fleet.' });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting car.' });
  }
};
