const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  getNotificationLogs,
  sendAdminManualEmail,
  sendAdminManualSms,
  testAdminEmail,
  testAdminSms
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/customers', getAdminCustomers);

// Admin Notifications & Test Routes
router.get('/notifications/logs', getNotificationLogs);
router.post('/notifications/send-email', sendAdminManualEmail);
router.post('/notifications/send-sms', sendAdminManualSms);
router.post('/email/send', sendAdminManualEmail);
router.post('/test-email', testAdminEmail);
router.post('/test-sms', testAdminSms);

module.exports = router;
