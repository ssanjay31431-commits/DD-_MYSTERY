const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'dd_mystery_box_jwt_secret_key_change_in_production_2026';
};

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'undefined' || token === 'null' || token === '[object Object]') {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        console.error('[AuthMiddleware] Token error: jwt expired');
        return res.status(401).json({
          success: false,
          message: 'Your session expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      console.error('[AuthMiddleware] Token error:', verifyError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
        code: 'INVALID_TOKEN'
      });
    }

    const userId = decoded.id || decoded.userId || decoded._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'INVALID_TOKEN'
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('[AuthMiddleware] Exception error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'undefined' && token !== 'null' && token !== '[object Object]') {
        const decoded = jwt.verify(token, getJwtSecret());
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
    res.status(403).json({
      success: false,
      message: 'Forbidden, Admin access required',
      code: 'ADMIN_REQUIRED'
    });
  }
};

module.exports = { protect, optionalAuth, admin };
