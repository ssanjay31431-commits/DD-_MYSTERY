const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'undefined' || token === 'null' || token === '[object Object]') {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dd_mystery_box_jwt_secret_key_change_in_production_2026');
    const userId = decoded.id || decoded.userId || decoded._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('[AuthMiddleware] Token error:', error.message);
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'undefined' && token !== 'null' && token !== '[object Object]') {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dd_mystery_box_jwt_secret_key_change_in_production_2026');
        const userId = decoded.id || decoded.userId || decoded._id;
        if (userId) {
          req.user = await User.findById(userId).select('-password');
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden, Admin access required' });
  }
};

module.exports = { protect, optionalAuth, admin };
