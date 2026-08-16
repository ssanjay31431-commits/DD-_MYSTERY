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
  testAdminSms,
  getFailedPayments,
  recoverPaymentOrder
} = require('../controllers/adminController');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/customers', getAdminCustomers);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Failed Payment Recovery Routes
router.get('/failed-payments', getFailedPayments);
router.post('/recover-payment/:id', recoverPaymentOrder);

// Admin Notifications & Test Routes
router.get('/notifications/logs', getNotificationLogs);
router.post('/notifications/send-email', sendAdminManualEmail);
router.post('/notifications/send-sms', sendAdminManualSms);
router.post('/email/send', sendAdminManualEmail);
router.post('/test-email', testAdminEmail);
router.post('/test-sms', testAdminSms);

module.exports = router;
