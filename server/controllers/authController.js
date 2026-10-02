const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { syncUserLog } = require('../utils/sheets');
const { saveBase64Image } = require('../utils/upload');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate token and set cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'rhinovoyagesecretkey123456789!',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  const { password, ...userWithoutPassword } = user;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userWithoutPassword
    });
};

// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, aadhar, license, aadharPhoto, licensePhoto } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (name, email, password, phone).' });
    }

    if (role === 'driver') {
      if (!aadhar || !license) {
        return res.status(400).json({ success: false, message: 'Please provide Aadhar Card Number and Driving License Number.' });
      }
      if (!aadharPhoto || !licensePhoto) {
        return res.status(400).json({ success: false, message: 'Please upload both Aadhar Card and Driving License photos.' });
      }
    }

    // Check if user already exists
    const existingUser = await One('users', { email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user data
    const userRole = role === 'driver' ? 'driver' : 'user';
    const insertData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: userRole
    };

    if (userRole === 'driver') {
      try {
        insertData.aadhar = aadhar;
        insertData.license = license;
        insertData.aadharPhoto = saveBase64Image(aadharPhoto, 'aadhar');
        insertData.licensePhoto = saveBase64Image(licensePhoto, 'license');
        insertData.verificationStatus = 'Pending';
      } catch (uploadErr) {
        return res.status(400).json({ success: false, message: uploadErr.message });
      }
    }

    const newUser = await ('users', insertData);

    // Sync user registration to Google Sheet
    syncUserLog(newUser, 'register').catch(err => console.error('Register sheet sync error:', err));

    sendTokenResponse(newUser, 201, res);
  } catch (error) {
    console.error('Registration controller error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// @desc    Login User/Admin
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password.' });
    }

    // Find user
    const user = await One('users', { email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    // Check role matches if specified (e.g. user selected Admin login)
    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: `Access denied. Account is not registered as an '${role}'.` });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    // Sync user login to Google Sheet
    syncUserLog(user, 'login').catch(err => console.error('Login sheet sync error:', err));

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login controller error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// @desc    Logout User / Clear Cookie
// @route   GET /api/auth/logout
// @access  Public
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // expire in 10s
    httpOnly: true
  });

  res.status(200).json({ success: true, message: 'Successfully logged out.' });
};

// @desc    Get Current Logged In User
// @route   GET /api/auth/me
// @access  Private
exports.getMe = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// @desc    Get Google Client ID
// @route   GET /api/auth/google-client-id
// @access  Public
exports.getGoogleClientId = (req, res) => {
  res.status(200).json({ success: true, clientId: process.env.GOOGLE_CLIENT_ID });
};

// @desc    Google Sign In
// @route   POST /api/auth/google
// @access  Public
exports.googleSignIn = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ success: false, message: 'Google credential token is missing.' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await One('users', { email: email.toLowerCase() });

    if (!user) {
      // Create a new user automatically
      const newUser = {
        name,
        email: email.toLowerCase(),
        phone: '', // Google does not provide phone by default in sign in
        role: 'user',
        password: '', // No password for OAuth users
        createdAt: new Date().toISOString()
      };
      user = await ('users', newUser);
    }

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Google Sign-In Error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired Google token.' });
  }
};
