const express = require('express');
const router = express.Router();
const { createPaymentSession, confirmPaymentAndCreateOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/create-session', createPaymentSession);
router.post('/create-order', createPaymentSession); // Alias for compatibility
router.post('/confirm-payment', confirmPaymentAndCreateOrder);
router.post('/verify', confirmPaymentAndCreateOrder); // Alias for compatibility

module.exports = router;
