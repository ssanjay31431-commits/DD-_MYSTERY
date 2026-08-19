const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const AdminSettings = require('../models/AdminSettings');
const Cart = require('../models/Cart');
const Payment = require('../models/Payment');
const NotificationLog = require('../models/NotificationLog');
const { generateOrderId } = require('../utils/orderIdGenerator');
const { sendNotification } = require('../utils/emailService');

// @desc Get Dynamic UPI Payment Details for an Order
// @route GET /api/payments/order/:id
const getPaymentDetailsForOrder = async (req, res) => {
  try {
    const param = req.params.id;
    let order;

    if (param.startsWith('DDMB-') || param.startsWith('DM')) {
      order = await Order.findOne({ $or: [{ orderId: param }, { orderNumber: param }] }).populate('user', 'name email phone');
    } else if (param.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(param).populate('user', 'name email phone');
    } else {
      order = await Order.findOne({ $or: [{ orderId: param }, { orderNumber: param }] }).populate('user', 'name email phone');
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Auth check: User must own the order or be an admin
    if (
      req.user.role !== 'admin' &&
      order.user &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view payment details for this order' });
    }

    // Fetch Admin Settings for configured UPI ID & Display Name
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = {
        upiId: 'david468468@airtel',
        upiName: 'Sagariya David S',
        paymentMethodName: 'Manual UPI'
      };
    }

    const upiId = settings.upiId || 'david468468@airtel';
    const upiName = settings.upiName || 'Sagariya David S';
    const displayOrderId = order.orderNumber || order.orderId || order._id.toString();
    const amountToPay = order.totalAmount || order.pricing?.totalAmount || 499;

    // Standard UPI URI format with pre-filled exact order amount
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amountToPay}&cu=INR&tn=${displayOrderId}`;

    // Get or initialize Payment record
    let payment = await Payment.findOne({ order: order._id });
    if (!payment) {
      payment = await Payment.create({
        order: order._id,
        orderId: displayOrderId,
        customer: order.user?._id || req.user._id,
        amount: amountToPay,
        upiId,
        upiName,
        paymentReference: displayOrderId,
        status: order.orderStatus === 'ORDER_CONFIRMED' || order.orderStatus === 'CONFIRMED' || order.orderStatus === 'PAYMENT_COMPLETED' ? 'PAYMENT_COMPLETED' : 'PENDING_PAYMENT'
      });
    }

    res.json({
      success: true,
      orderId: displayOrderId,
      orderMongoId: order._id,
      amount: amountToPay,
      upiId,
      upiName,
      paymentMethod: settings.paymentMethodName || 'Manual UPI',
      upiUri,
      orderStatus: order.orderStatus,
      paymentStatus: payment ? payment.status : order.orderStatus,
      screenshotUrl: payment ? payment.screenshotUrl : '',
      submittedAt: payment ? payment.submittedAt : null,
      verifiedAt: payment ? payment.verifiedAt : null
    });
  } catch (error) {
    console.error('[Get Payment Details Error]', error);
    res.status(500).json({ message: error.message || 'Failed to fetch payment details' });
  }
};

// @desc Customer Uploads Payment Screenshot
// @route POST /api/payments/upload-screenshot
const uploadPaymentScreenshot = async (req, res) => {
  try {
    const { orderId: paramOrderId, screenshotUrl } = req.body;

    if (!paramOrderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    if (!screenshotUrl) {
      return res.status(400).json({ message: 'Payment screenshot image is required' });
    }

    let order;
    if (paramOrderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(paramOrderId);
    } else {
      order = await Order.findOne({ $or: [{ orderId: paramOrderId }, { orderNumber: paramOrderId }] });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ownership check
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to submit screenshot for this order' });
    }

    let settings = await AdminSettings.findOne();
    const upiId = settings?.upiId || 'david468468@airtel';
    const upiName = settings?.upiName || 'Sagariya David S';
    const displayOrderId = order.orderNumber || order.orderId || order._id.toString();
    const amountToPay = order.totalAmount || order.pricing?.totalAmount || 499;

    let payment = await Payment.findOne({ order: order._id });
    if (!payment) {
      payment = new Payment({
        order: order._id,
        orderId: displayOrderId,
        customer: req.user._id,
        amount: amountToPay,
        upiId,
        upiName,
        paymentReference: displayOrderId
      });
    }

    payment.screenshotUrl = screenshotUrl;
    payment.status = 'PAYMENT_VERIFICATION';
    payment.submittedAt = new Date();
    await payment.save();

    // Update order status to PAYMENT_VERIFICATION
    order.orderStatus = 'PAYMENT_VERIFICATION';
    order.trackingHistory.push({
      status: 'PAYMENT_VERIFICATION',
      comment: 'Payment screenshot submitted by customer. Verification in progress.',
      timestamp: new Date()
    });
    await order.save();

    // Log admin notification
    try {
      await NotificationLog.create({
        orderId: displayOrderId,
        userId: req.user._id,
        customerName: req.user.name || 'Customer',
        recipient: 'ADMIN',
        channel: 'Dashboard',
        type: 'PAYMENT_SCREENSHOT_SUBMITTED',
        event: 'PAYMENT_SCREENSHOT_SUBMITTED',
        status: 'Sent',
        provider: 'System',
        subject: `Payment Screenshot Submitted for ${displayOrderId}`,
        content: `Customer ${req.user.name || 'Customer'} uploaded payment screenshot for order ${displayOrderId} (Amount: ₹${amountToPay}).`,
        idempotencyKey: `ADMIN_${displayOrderId}_SCREENSHOT_${Date.now()}`
      });
    } catch (e) {
      console.error('[NotificationLog Warning]', e.message);
    }

    res.json({
      success: true,
      message: 'Payment screenshot submitted successfully. Verification is in progress.',
      paymentStatus: payment.status,
      orderStatus: order.orderStatus,
      payment
    });
  } catch (error) {
    console.error('[Upload Screenshot Error]', error);
    res.status(500).json({ message: error.message || 'Failed to upload screenshot' });
  }
};

// @desc Admin Get All Verification Pending Payments
// @route GET /api/payments/admin/pending
const adminGetPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('customer', 'name email phone')
      .populate({
        path: 'order',
        populate: { path: 'user', select: 'name email phone' }
      })
      .sort({ updatedAt: -1 });

    // Also gather orders that might not have a Payment record yet but are in system
    const ordersWithPayments = payments.map(p => p.order?._id?.toString()).filter(Boolean);
    const orphanOrders = await Order.find({ _id: { $nin: ordersWithPayments } })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    const formattedOrphans = orphanOrders.map(ord => ({
      _id: `temp_${ord._id}`,
      order: ord,
      orderId: ord.orderNumber || ord.orderId,
      customer: ord.user,
      amount: ord.totalAmount || 499,
      upiId: 'david468468@airtel',
      upiName: 'Sagariya David S',
      paymentReference: ord.orderNumber || ord.orderId,
      screenshotUrl: '',
      status: ord.orderStatus || 'PENDING_PAYMENT',
      createdAt: ord.createdAt,
      updatedAt: ord.updatedAt
    }));

    res.json([...payments, ...formattedOrphans]);
  } catch (error) {
    console.error('[Admin Pending Payments Error]', error);
    res.status(500).json({ message: error.message || 'Failed to fetch pending payments' });
  }
};

// @desc Admin Approves Payment for an Order ("Payment Completed")
// @route PUT /api/payments/admin/verify/:id
const adminVerifyPayment = async (req, res) => {
  try {
    const targetId = req.params.id;
    let payment = await Payment.findById(targetId);
    let order;

    if (payment) {
      order = await Order.findById(payment.order).populate('user', 'name email phone');
    } else {
      order = await Order.findOne({ $or: [{ _id: targetId.replace('temp_', '') }, { orderId: targetId }, { orderNumber: targetId }] }).populate('user', 'name email phone');
      if (order) {
        payment = await Payment.findOne({ order: order._id });
        if (!payment) {
          payment = new Payment({
            order: order._id,
            orderId: order.orderNumber || order.orderId,
            customer: order.user?._id || req.user._id,
            amount: order.totalAmount || 499,
            upiId: 'david468468@airtel',
            upiName: 'Sagariya David S',
            paymentReference: order.orderNumber || order.orderId
          });
        }
      }
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found for verification' });
    }

    // Mark payment as PAYMENT_COMPLETED
    payment.status = 'PAYMENT_COMPLETED';
    payment.verifiedAt = new Date();
    payment.verifiedBy = req.user._id;
    await payment.save();

    // Mark order status as PAYMENT_COMPLETED then ORDER_CONFIRMED
    order.orderStatus = 'ORDER_CONFIRMED';
    order.paymentInfo = {
      ...order.paymentInfo,
      status: 'PAID',
      provider: 'MANUAL_UPI',
      transactionId: `UPI_VERIFIED_${Date.now()}`
    };
    order.amountPaid = order.totalAmount;
    order.advancePaid = order.totalAmount;
    order.remainingBalance = 0;
    order.remainingCodAmount = 0;

    order.trackingHistory.push({
      status: 'ORDER_CONFIRMED',
      comment: 'Payment verified by DD Mystery Box Admin. Order Confirmed!',
      timestamp: new Date()
    });

    const updatedOrder = await order.save();

    // Dispatch confirmation notification
    try {
      await sendNotification({
        type: 'ORDER_CONFIRMATION',
        order: updatedOrder,
        orderId: updatedOrder.orderNumber || updatedOrder.orderId,
        recipientEmail: order.user?.email,
        recipientPhone: order.user?.phone
      });
    } catch (e) {
      console.error('[Notification Warning]', e.message);
    }

    res.json({
      success: true,
      message: `Payment verified and order ${updatedOrder.orderNumber || updatedOrder.orderId} confirmed successfully!`,
      order: updatedOrder,
      payment
    });
  } catch (error) {
    console.error('[Admin Verify Payment Error]', error);
    res.status(500).json({ message: error.message || 'Payment verification failed' });
  }
};

// Legacy compatibility fallbacks if required
const createPaymentSession = async (req, res) => {
  res.json({ message: 'Cashfree session replaced with Dynamic UPI QR Manual Payment.' });
};
const confirmPaymentAndCreateOrder = async (req, res) => {
  res.json({ message: 'Please use manual payment verification endpoints.' });
};

module.exports = {
  getPaymentDetailsForOrder,
  uploadPaymentScreenshot,
  adminGetPendingPayments,
  adminVerifyPayment,
  createPaymentSession,
  confirmPaymentAndCreateOrder
};
