const express = require('express');
const router = express.Router();
const {
  createCashfreeOrder,
  verifyCashfreePayment,
  handleCashfreeWebhook,
  adminGetPaymentsList
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public Webhook route (Cashfree server-to-server call)
router.post('/webhook', handleCashfreeWebhook);

// Protected Customer payment routes
router.post('/create-order', protect, createCashfreeOrder);
router.get('/status/:orderId', protect, verifyCashfreePayment);
router.post('/verify', protect, verifyCashfreePayment);

// Compatibility alias for session creation
router.post('/create-session', protect, createCashfreeOrder);

// Protected Admin payment routes
router.get('/admin/pending', protect, admin, adminGetPaymentsList);
router.get('/admin/list', protect, admin, adminGetPaymentsList);

module.exports = router;
