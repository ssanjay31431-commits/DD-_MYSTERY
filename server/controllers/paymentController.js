const crypto = require('crypto');
const Order = require('../models/Order');
const { getRazorpayInstance } = require('../config/razorpay');
const { sendNotification } = require('../utils/emailService');

// @desc Create Razorpay Order for calculated Advance Required amount ONLY
// @route POST /api/payments/create-order
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    let order;
    if (orderId.startsWith('DDMB-')) {
      order = await Order.findOne({ orderId });
    } else {
      order = await Order.findById(orderId);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order record not found' });
    }

    // ALWAYS use backend-calculated advanceRequired amount. Never trust frontend amount!
    const advanceAmount = order.advanceRequired || Math.round(order.totalAmount * 0.2);
    const amountInPaise = Math.round(advanceAmount * 100);

    const razorpay = getRazorpayInstance();

    if (razorpay) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: order.orderId
      };
      const razorpayOrder = await razorpay.orders.create(options);
      return res.json({
        id: razorpayOrder.id,
        currency: razorpayOrder.currency,
        amount: razorpayOrder.amount,
        advanceAmount: advanceAmount,
        totalAmount: order.totalAmount,
        remainingCodAmount: order.remainingCodAmount,
        isMockMode: false,
        key: process.env.RAZORPAY_KEY_ID
      });
    } else {
      // Safe Test/Mock Mode fallback for development
      const mockRazorpayOrderId = `rzp_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      return res.json({
        id: mockRazorpayOrderId,
        currency: 'INR',
        amount: amountInPaise,
        advanceAmount: advanceAmount,
        totalAmount: order.totalAmount,
        remainingCodAmount: order.remainingCodAmount,
        isMockMode: true,
        key: 'rzp_test_mockkey123',
        message: 'Development Mock Payment Mode active'
      });
    }
  } catch (error) {
    console.error('[Payment Controller Error]', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc Verify Razorpay Payment Signature for Advance Payment
// @route POST /api/payments/verify
const verifyPayment = async (req, res) => {
  try {
    const { dbOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, isMockMode } = req.body;

    const order = await Order.findById(dbOrderId);
    if (!order) {
      return res.status(404).json({ message: 'Target order not found for payment verification' });
    }

    if (isMockMode || !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET.includes('secretkey12345')) {
      // Verification for Test / Mock Payment Mode
      order.advancePaid = order.advanceRequired;
      order.paymentInfo = {
        razorpayOrderId: razorpay_order_id || `rzp_mock_${Date.now()}`,
        razorpayPaymentId: razorpay_payment_id || `pay_mock_${Date.now()}`,
        razorpaySignature: razorpay_signature || 'mock_valid_sig',
        method: 'Advance + Cash on Delivery',
        advanceStatus: 'Paid',
        codStatus: 'Pending'
      };
      order.orderStatus = 'Order Confirmed';
      order.trackingHistory.push({
        status: 'Advance Payment Confirmed',
        comment: `Advance payment of ₹${order.advanceRequired} verified. Remaining COD amount: ₹${order.remainingCodAmount}`
      });

      await order.save();

      // AUTOMATIC NOTIFICATION DISPATCH (Brevo Email + SMS)
      sendNotification({
        type: 'PAYMENT_CONFIRMATION',
        order,
        orderId: order.orderId
      }).catch(err => console.error('[Payment Notification Error]', err.message));

      return res.json({ success: true, message: 'Test mode advance payment verified successfully', order });
    }

    // Production / Live HMAC SHA256 Signature Verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      order.advancePaid = order.advanceRequired;
      order.paymentInfo = {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        method: 'Advance + Cash on Delivery',
        advanceStatus: 'Paid',
        codStatus: 'Pending'
      };
      order.orderStatus = 'Order Confirmed';
      order.trackingHistory.push({
        status: 'Advance Payment Confirmed',
        comment: `Advance online payment of ₹${order.advanceRequired} verified. Remaining COD to collect: ₹${order.remainingCodAmount}`
      });

      await order.save();

      // AUTOMATIC NOTIFICATION DISPATCH (Brevo Email + SMS)
      sendNotification({
        type: 'PAYMENT_CONFIRMATION',
        order,
        orderId: order.orderId
      }).catch(err => console.error('[Payment Notification Error]', err.message));

      return res.json({ success: true, message: 'Advance payment signature verified successfully', order });
    } else {
      order.paymentInfo.advanceStatus = 'Failed';
      await order.save();
      return res.status(400).json({ success: false, message: 'Invalid payment signature. Advance verification failed.' });
    }
  } catch (error) {
    console.error('[Payment Verification Error]', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPaymentOrder, verifyPayment };
