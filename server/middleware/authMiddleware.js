const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Protect routes - verify user is logged in
exports.protect = (req, res, next) => {
  let token;

  // Read token from cookies (preferred) or Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route. Please log in.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rhinovoyagesecretkey123456789!');

    // Get user from database (exclude password)
    const user = db.findOne('users', { id: decoded.id });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User matching this token no longer exists.' });
    }

    // Attach user to req
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    console.error('Auth protect middleware error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route.` 
      });
    }
    next();
  };
};

// Optional protect - if logged in attach user, otherwise proceed as guest
exports.optionalProtect = (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rhinovoyagesecretkey123456789!');
    const user = db.findOne('users', { id: decoded.id });
    if (user) {
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword;
    }
    next();
  } catch (error) {
    next();
  }
};
