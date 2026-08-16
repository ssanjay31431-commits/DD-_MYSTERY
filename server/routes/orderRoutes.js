const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  cancelOrder,
  getOrderTracking
} = require('../controllers/orderController');
const { confirmPaymentAndCreateOrder } = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/confirm-payment', confirmPaymentAndCreateOrder);

router.route('/')
  .post(createOrder)
  .get(getMyOrders);

router.get('/admin/all', admin, getAllOrders);
router.put('/admin/:id/status', admin, updateOrderStatus);

router.get('/tracking/:id', getOrderTracking);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
