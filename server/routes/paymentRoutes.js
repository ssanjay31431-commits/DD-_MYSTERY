const express = require('express');
const router = express.Router();
const {
  createCashfreeOrder,
  verifyCashfreePayment,
  handleCashfreeWebhook,
  adminGetPendingPayments
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public Webhook route for Cashfree event notifications
router.post('/webhook', handleCashfreeWebhook);

// Protected Customer payment routes
router.post('/create-order', protect, createCashfreeOrder);
router.post('/create-cashfree-order', protect, createCashfreeOrder);
router.get('/order/:orderId', protect, verifyCashfreePayment);
router.get('/status/:orderId', protect, verifyCashfreePayment);
router.get('/verify/:orderId', protect, verifyCashfreePayment);

// Protected Admin payment routes
router.get('/admin/pending', protect, admin, adminGetPendingPayments);
router.get('/admin/list', protect, admin, adminGetPendingPayments);

module.exports = router;
