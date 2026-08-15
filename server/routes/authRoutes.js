const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleAuth, getUserProfile, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { sendNotification } = require('../utils/emailService');
const Order = require('../models/Order');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Health check endpoint for testing authentication
router.get('/health', protect, (req, res) => {
  res.json({ 
    message: 'Authentication successful',
    user: { id: req.user._id, email: req.user.email, name: req.user.name }
  });
});

// TEST ENDPOINT: Send test notification for verification
// @route POST /api/auth/test-notification/:orderId
// @access Protected
router.post('/test-notification/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('user');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const result = await sendNotification({
      type: 'TEST_NOTIFICATION',
      order,
      orderId: order.orderId,
      customMessage: '🧪 This is a test notification. If you received this email and SMS, our notification system is working correctly!'
    });

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      details: {
        orderId: order.orderId,
        customerEmail: order.user?.email,
        customerPhone: order.deliveryAddressSnapshot?.mobileNumber || order.user?.phone,
        emailSent: result.emailResult.success,
        smsSent: result.smsResult.success
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
