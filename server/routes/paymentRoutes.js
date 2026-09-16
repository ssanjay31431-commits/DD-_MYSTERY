const express = require('express');
const router = express.Router();
const {
  confirmPaymentAndCreateOrder,
  getPaymentDetailsForOrder,
  uploadPaymentScreenshot,
  adminGetPendingPayments,
  adminVerifyPayment,
  adminRejectPayment
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Protected Customer payment routes
router.post('/create-order', protect, confirmPaymentAndCreateOrder);
router.get('/order/:orderId', protect, getPaymentDetailsForOrder);
router.get('/status/:orderId', protect, getPaymentDetailsForOrder);
router.post('/upload-screenshot', protect, uploadPaymentScreenshot);

// Protected Admin payment routes
router.get('/admin/pending', protect, admin, adminGetPendingPayments);
router.get('/admin/list', protect, admin, adminGetPendingPayments);
router.put('/admin/verify/:id', protect, admin, adminVerifyPayment);
router.post('/admin/verify/:id', protect, admin, adminVerifyPayment);
router.put('/admin/reject/:id', protect, admin, adminRejectPayment);
router.post('/admin/reject/:id', protect, admin, adminRejectPayment);

module.exports = router;
