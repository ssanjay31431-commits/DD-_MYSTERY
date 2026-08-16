const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dd_mystery_box_jwt_secret_key_change_in_production_2026');
      req.user = await User.findById(decoded.id).select('-password');
      if (req.user) {
        return next();
      }
    } catch (error) {
      console.error('[AuthMiddleware] Token error:', error.message);
    }
  }

  // If no token or token invalid, allow request to continue so controller can attach/create guest user safely
  next();
};

const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dd_mystery_box_jwt_secret_key_change_in_production_2026');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {}
  }
  next();
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden, Admin access required' });
  }
};

module.exports = { protect, optionalAuth, admin };
