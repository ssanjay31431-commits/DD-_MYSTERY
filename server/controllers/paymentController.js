const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Payment = require('../models/Payment');
const AdminSettings = require('../models/AdminSettings');
const NotificationLog = require('../models/NotificationLog');
const { generateOrderId } = require('../utils/orderIdGenerator');
const { sendNotification } = require('../utils/emailService');

// @desc Create Order for Manual UPI Payment
// @route POST /api/payments/create-order
const confirmPaymentAndCreateOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, subtotal, deliveryFee = 0, couponDiscount = 0, couponCode = '', totalAmount: reqTotalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    const calculatedSubtotal = items.reduce((acc, item) => {
      const price = item.unitPrice || item.product?.price || item.price || 0;
      return acc + price * (item.quantity || 1);
    }, 0);

    const totalAmount = Math.max(1, Math.round(calculatedSubtotal + deliveryFee - couponDiscount));

    if (isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid total payment amount' });
    }

    const customOrderId = await generateOrderId();
    const settings = (await AdminSettings.findOne()) || {};
    const upiId = settings.upiId || 'david468468@airtel';
    const upiName = settings.upiName || 'Sagariya David S';

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 4);

    const orderItems = items.map((item) => ({
      product: item.product?._id || item.product,
      productSnapshot: {
        name: item.product?.name || item.name || 'DD Mystery Box',
        image: item.product?.image || item.image || '',
        price: item.unitPrice || item.price || 0,
        description: item.product?.description || '',
        contents: item.product?.contents || []
      },
      customizationSnapshot: item.customization || {},
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || item.price || 0
    }));

    const order = new Order({
      orderNumber: customOrderId,
      orderId: customOrderId,
      user: req.user._id,
      items: orderItems,
      deliveryAddressSnapshot: deliveryAddress,
      pricing: {
        subtotal: calculatedSubtotal,
        deliveryFee,
        couponDiscount,
        totalAmount,
        advanceAmount: 0,
        amountPaid: 0,
        remainingBalance: totalAmount
      },
      subtotal: calculatedSubtotal,
      deliveryFee,
      couponDiscount,
      couponCode,
      totalAmount,
      advanceAmount: 0,
      advancePaid: 0,
      amountPaid: 0,
      remainingBalance: totalAmount,
      remainingCodAmount: 0,
      paymentInfo: {
        method: 'Manual UPI',
        provider: 'MANUAL_UPI',
        status: 'PENDING',
        paymentOrderId: customOrderId
      },
      orderStatus: 'PENDING_PAYMENT',
      trackingHistory: [
        {
          status: 'PENDING_PAYMENT',
          comment: 'Order registered. Please scan GPay QR and upload payment screenshot to complete order.',
          timestamp: new Date()
        }
      ],
      expectedDeliveryDate: expectedDelivery,
      luckyRewardUnlocked: totalAmount >= 199
    });

    const createdOrder = await order.save();

    await Payment.create({
      order: createdOrder._id,
      orderId: customOrderId,
      customer: req.user._id,
      amount: totalAmount,
      upiId,
      upiName,
      paymentReference: customOrderId,
      status: 'PENDING_PAYMENT'
    }).catch((err) => console.error('[Payment Record Warning]', err.message));

    // Clear cart after placing order
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], couponApplied: { code: '', discountAmount: 0 } }
    ).catch(() => {});

    res.status(201).json({
      success: true,
      order_id: customOrderId,
      orderMongoId: createdOrder._id,
      amount: totalAmount,
      order: createdOrder
    });
  } catch (error) {
    console.error('[Create Order Error]', error);
    res.status(500).json({ message: error.message || 'Order creation failed' });
  }
};

// @desc Get Payment Details for Order (QR code & screenshot status)
// @route GET /api/payments/order/:orderId
const getPaymentDetailsForOrder = async (req, res) => {
  try {
    const param = req.params.orderId;
    let order;

    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(param).populate('user', 'name email phone');
    } else {
      order = await Order.findOne({ $or: [{ orderId: param }, { orderNumber: param }] }).populate('user', 'name email phone');
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const settings = (await AdminSettings.findOne()) || {};
    const upiId = settings.upiId || 'david468468@airtel';
    const upiName = settings.upiName || 'Sagariya David S';

    let payment = await Payment.findOne({ order: order._id });

    res.json({
      success: true,
      order,
      payment,
      upiId,
      upiName,
      amountToPay: order.totalAmount,
      screenshotUrl: payment?.screenshotUrl || '',
      status: payment?.status || order.paymentInfo?.status || order.orderStatus
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
    const { orderId, screenshotUrl, screenshot } = req.body;
    const finalScreenshot = screenshotUrl || screenshot;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    if (!finalScreenshot) {
      return res.status(400).json({ message: 'Payment screenshot image is required' });
    }

    let order = await Order.findOne({ $or: [{ orderId }, { orderNumber: orderId }, { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }] });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = 'SCREENSHOT_SUBMITTED';
    if (order.paymentInfo) {
      order.paymentInfo.status = 'SCREENSHOT_SUBMITTED';
    }
    if (!order.trackingHistory.some((t) => t.status === 'SCREENSHOT_SUBMITTED')) {
      order.trackingHistory.push({
        status: 'SCREENSHOT_SUBMITTED',
        comment: 'Payment screenshot submitted by customer. Awaiting admin verification.',
        timestamp: new Date()
      });
    }

    const updatedOrder = await order.save();

    let payment = await Payment.findOne({ order: order._id });
    if (payment) {
      payment.screenshotUrl = finalScreenshot;
      payment.status = 'SCREENSHOT_SUBMITTED';
      payment.submittedAt = new Date();
      await payment.save();
    } else {
      payment = await Payment.create({
        order: order._id,
        orderId: order.orderNumber || order.orderId,
        customer: order.user,
        amount: order.totalAmount,
        screenshotUrl: finalScreenshot,
        paymentReference: order.orderNumber || order.orderId,
        status: 'SCREENSHOT_SUBMITTED',
        submittedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Payment screenshot uploaded successfully! Pending Admin verification.',
      order: updatedOrder,
      payment
    });
  } catch (error) {
    console.error('[Upload Screenshot Error]', error);
    res.status(500).json({ message: error.message || 'Failed to upload screenshot' });
  }
};

// @desc Get List of Payments for Admin Verification Dashboard
// @route GET /api/payments/admin/pending
// @route GET /api/payments/admin/list
const adminGetPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('customer', 'name email phone')
      .populate({
        path: 'order',
        populate: { path: 'user', select: 'name email phone' }
      })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(100);

    // Also fetch orders directly that might be pending verification without payment docs
    const pendingOrders = await Order.find({
      orderStatus: { $in: ['PENDING_PAYMENT', 'SCREENSHOT_SUBMITTED', 'PAYMENT_VERIFICATION'] }
    })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    const mergedList = [...payments];

    // Guarantee orders are present in the list even if Payment doc wasn't populated properly
    pendingOrders.forEach((ord) => {
      const exists = mergedList.some(
        (p) => String(p.order?._id || p.order) === String(ord._id) || p.orderId === ord.orderNumber || p.orderId === ord.orderId
      );
      if (!exists) {
        mergedList.push({
          _id: `temp_${ord._id}`,
          order: ord,
          orderId: ord.orderNumber || ord.orderId,
          customer: ord.user,
          amount: ord.totalAmount,
          screenshotUrl: '',
          status: ord.orderStatus,
          createdAt: ord.createdAt
        });
      }
    });

    res.json(mergedList);
  } catch (error) {
    console.error('[Admin Pending Payments Error]', error);
    res.status(500).json({ message: error.message || 'Failed to fetch pending payments' });
  }
};

// @desc Admin Approves Payment for an Order ("Payment Completed")
// @route PUT /api/payments/admin/verify/:id
// @route POST /api/payments/admin/verify/:id
const adminVerifyPayment = async (req, res) => {
  try {
    const targetId = req.params.id;
    let payment = await Payment.findById(targetId);
    let order;

    if (payment) {
      order = await Order.findById(payment.order).populate('user', 'name email phone');
    } else {
      const cleanId = targetId.replace('temp_', '');
      order = await Order.findOne({
        $or: [{ _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }, { orderId: targetId }, { orderNumber: targetId }]
      }).populate('user', 'name email phone');

      if (order) {
        payment = await Payment.findOne({ order: order._id });
        if (!payment) {
          payment = await Payment.create({
            order: order._id,
            orderId: order.orderNumber || order.orderId,
            customer: order.user?._id || req.user._id,
            amount: order.totalAmount,
            paymentReference: order.orderNumber || order.orderId
          });
        }
      }
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found for verification' });
    }

    if (payment) {
      payment.status = 'PAYMENT_COMPLETED';
      payment.verifiedAt = new Date();
      payment.verifiedBy = req.user._id;
      await payment.save();
    }

    order.orderStatus = 'ORDER_CONFIRMED';
    order.paymentInfo = {
      ...order.paymentInfo,
      method: 'Manual UPI',
      status: 'PAYMENT_COMPLETED',
      provider: 'MANUAL_UPI',
      transactionId: `UPI_VERIFIED_${Date.now()}`
    };

    if (order.pricing) {
      order.pricing.amountPaid = order.totalAmount;
      order.pricing.remainingBalance = 0;
    }
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

    // Clear user cart if any
    if (order.user?._id) {
      await Cart.findOneAndUpdate(
        { user: order.user._id },
        { items: [], couponApplied: { code: '', discountAmount: 0 } }
      ).catch(() => {});
    }

    // Dispatch confirmation notification email/SMS
    try {
      await sendNotification({
        type: 'ORDER_CONFIRMATION',
        order: updatedOrder,
        orderId: updatedOrder.orderNumber || updatedOrder.orderId,
        recipientEmail: order.user?.email || order.deliveryAddressSnapshot?.email,
        recipientPhone: order.user?.phone || order.deliveryAddressSnapshot?.mobileNumber
      });
    } catch (e) {
      console.error('[Notification Warning on Verify]', e.message);
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

// @desc Admin Rejects Payment for an Order ("Payment Rejected")
// @route PUT /api/payments/admin/reject/:id
// @route POST /api/payments/admin/reject/:id
const adminRejectPayment = async (req, res) => {
  try {
    const targetId = req.params.id;
    const { reason } = req.body || {};
    let payment = await Payment.findById(targetId);
    let order;

    if (payment) {
      order = await Order.findById(payment.order).populate('user', 'name email phone');
    } else {
      const cleanId = targetId.replace('temp_', '');
      order = await Order.findOne({
        $or: [{ _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }, { orderId: targetId }, { orderNumber: targetId }]
      }).populate('user', 'name email phone');

      if (order) {
        payment = await Payment.findOne({ order: order._id });
      }
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found for rejection' });
    }

    const displayOrderId = order.orderNumber || order.orderId || targetId;

    if (payment) {
      payment.status = 'REJECTED';
      payment.verifiedAt = new Date();
      payment.verifiedBy = req.user._id;
      await payment.save();
    }

    order.orderStatus = 'CANCELLED';
    if (order.paymentInfo) {
      order.paymentInfo.status = 'REJECTED';
    }
    order.trackingHistory.push({
      status: 'CANCELLED',
      comment: `Payment verification rejected by admin. Reason: ${reason || 'Your payment details or screenshot could not be verified.'}`,
      timestamp: new Date()
    });

    const updatedOrder = await order.save();

    // Dispatch rejection notification email to customer
    try {
      await sendNotification({
        type: 'CANCELLED',
        order: updatedOrder,
        orderId: displayOrderId,
        recipientEmail: order.user?.email || order.deliveryAddressSnapshot?.email,
        recipientPhone: order.user?.phone || order.deliveryAddressSnapshot?.mobileNumber,
        reason: reason || 'Your payment for this order could not be verified by the administrator.'
      });
    } catch (e) {
      console.error('[Notification Warning on Reject]', e.message);
    }

    res.json({
      success: true,
      message: `Payment rejected and order ${displayOrderId} cancelled. Notification email sent.`,
      order: updatedOrder,
      payment
    });
  } catch (error) {
    console.error('[Admin Reject Payment Error]', error);
    res.status(500).json({ message: error.message || 'Payment rejection failed' });
  }
};

module.exports = {
  confirmPaymentAndCreateOrder,
  getPaymentDetailsForOrder,
  uploadPaymentScreenshot,
  adminGetPendingPayments,
  adminVerifyPayment,
  adminRejectPayment,
  // Compatibility exports
  createCashfreeOrder: confirmPaymentAndCreateOrder,
  verifyCashfreePayment: getPaymentDetailsForOrder,
  handleCashfreeWebhook: (req, res) => res.json({ status: 'OK' }),
  adminGetPaymentsList: adminGetPendingPayments,
  createPaymentSession: confirmPaymentAndCreateOrder
};
