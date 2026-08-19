const express = require('express');
const router = express.Router();
const {
  getPaymentDetailsForOrder,
  uploadPaymentScreenshot,
  adminGetPendingPayments,
  adminVerifyPayment,
  createPaymentSession,
  confirmPaymentAndCreateOrder
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

// Customer endpoints
router.get('/order/:id', getPaymentDetailsForOrder);
router.post('/upload-screenshot', uploadPaymentScreenshot);

// Admin endpoints
router.get('/admin/pending', admin, adminGetPendingPayments);
router.put('/admin/verify/:id', admin, adminVerifyPayment);

// Compatibility aliases
router.post('/create-session', createPaymentSession);
router.post('/confirm-payment', confirmPaymentAndCreateOrder);
router.post('/verify', confirmPaymentAndCreateOrder);

module.exports = router;
