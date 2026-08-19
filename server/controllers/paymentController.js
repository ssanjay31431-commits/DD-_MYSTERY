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

// @desc Customer Uploads Payment Screenshot (And Creates Order in MongoDB on submission)
// @route POST /api/payments/upload-screenshot
const uploadPaymentScreenshot = async (req, res) => {
  try {
    const { orderId: paramOrderId, screenshotUrl, pendingCheckout } = req.body;

    if (!screenshotUrl) {
      return res.status(400).json({ message: 'Payment screenshot image is required' });
    }

    let order;
    let customOrderId;

    // Flow A: Create order in MongoDB ONLY NOW when screenshot is submitted
    if (pendingCheckout && pendingCheckout.items && pendingCheckout.deliveryAddress) {
      const { items, deliveryAddress, subtotal, deliveryFee = 0, couponDiscount = 0, couponCode = '' } = pendingCheckout;

      const calculatedSubtotal = items.reduce((acc, item) => {
        const price = item.unitPrice || item.product?.price || item.price || 0;
        return acc + price * (item.quantity || 1);
      }, 0);

      const totalAmount = Math.max(0, calculatedSubtotal + deliveryFee - couponDiscount);
      customOrderId = await generateOrderId();

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

      order = new Order({
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
          status: 'PAYMENT_VERIFICATION',
          paymentOrderId: customOrderId
        },
        orderStatus: 'PAYMENT_VERIFICATION',
        trackingHistory: [
          {
            status: 'PAYMENT_VERIFICATION',
            comment: 'Payment screenshot submitted by customer. Verification in progress.',
            timestamp: new Date()
          }
        ],
        expectedDeliveryDate: expectedDelivery,
        luckyRewardUnlocked: totalAmount >= 199
      });

      await order.save();

      // Clear customer's cart
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], couponApplied: { code: '', discountAmount: 0 } }).catch(e => {});
    } else if (paramOrderId) {
      if (paramOrderId.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findById(paramOrderId);
      } else {
        order = await Order.findOne({ $or: [{ orderId: paramOrderId }, { orderNumber: paramOrderId }] });
      }
    }

    if (!order) {
      return res.status(404).json({ message: 'Order details missing or order not found' });
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

    // Ensure order status and paymentInfo status are PAYMENT_VERIFICATION
    order.orderStatus = 'PAYMENT_VERIFICATION';
    if (order.paymentInfo) {
      order.paymentInfo.status = 'PAYMENT_VERIFICATION';
    }
    if (!order.trackingHistory.some(t => t.status === 'PAYMENT_VERIFICATION')) {
      order.trackingHistory.push({
        status: 'PAYMENT_VERIFICATION',
        comment: 'Payment screenshot submitted by customer. Verification in progress.',
        timestamp: new Date()
      });
    }
    await order.save();

    // Log admin notification so it appears on Admin Dashboard
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
      orderId: displayOrderId,
      orderMongoId: order._id,
      amount: amountToPay,
      paymentStatus: payment.status,
      orderStatus: order.orderStatus,
      payment
    });
  } catch (error) {
    console.error('[Upload Screenshot Error]', error);
    res.status(500).json({ message: error.message || 'Failed to upload screenshot' });
  }
};

// @desc Admin Get Verification Pending Payments (Only orders where screenshot has been uploaded or verification requested)
// @desc Admin Get Verification Pending Payments (Only orders where payment screenshot has been uploaded by customer)
// @route GET /api/payments/admin/pending
const adminGetPendingPayments = async (req, res) => {
  try {
    // Only return payment items where a screenshot has actually been submitted by the customer
    const payments = await Payment.find({
      screenshotUrl: { $exists: true, $ne: '', $regex: /.+/ },
      status: { $in: ['SCREENSHOT_SUBMITTED', 'PAYMENT_VERIFICATION', 'PAYMENT_COMPLETED'] }
    })
      .populate('customer', 'name email phone')
      .populate({
        path: 'order',
        populate: { path: 'user', select: 'name email phone' }
      })
      .sort({ updatedAt: -1 });

    res.json(payments);
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

    // Mark order status as ORDER_CONFIRMED
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

// Handle Checkout Order Creation (Seamless flow from /checkout)
const confirmPaymentAndCreateOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, subtotal, deliveryFee = 0, couponDiscount = 0, couponCode = '' } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    const calculatedSubtotal = items.reduce((acc, item) => {
      const price = item.unitPrice || item.product?.price || item.price || 0;
      return acc + price * (item.quantity || 1);
    }, 0);

    const totalAmount = Math.max(0, calculatedSubtotal + deliveryFee - couponDiscount);
    const customOrderId = await generateOrderId();

    const settings = await AdminSettings.findOne() || {};
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
          comment: 'Order registered. Please scan GPay QR and upload payment screenshot to complete order.'
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
    }).catch(err => console.error('Payment init warning:', err.message));

    // Clear cart after placing order
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], couponApplied: { code: '', discountAmount: 0 } }).catch(e => {});

    res.status(201).json({
      success: true,
      order: createdOrder
    });
  } catch (error) {
    console.error('[Confirm Payment & Create Order Error]', error);
    res.status(500).json({ message: error.message || 'Order creation failed' });
  }
};

const createPaymentSession = async (req, res) => {
  return confirmPaymentAndCreateOrder(req, res);
};

module.exports = {
  getPaymentDetailsForOrder,
  uploadPaymentScreenshot,
  adminGetPendingPayments,
  adminVerifyPayment,
  createPaymentSession,
  confirmPaymentAndCreateOrder
};
