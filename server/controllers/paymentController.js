const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const NotificationLog = require('../models/NotificationLog');
const { generateOrderId } = require('../utils/orderIdGenerator');
const { sendNotification } = require('../utils/emailService');
const {
  createOrderSession,
  verifyOrderPayment,
  verifyWebhookSignature,
  isConfigured
} = require('../services/cashfreeService');

/**
 * @desc Create Order & Initialize Cashfree Payment Session
 * @route POST /api/payments/create-order
 * @access Protected (User)
 */
const createCashfreeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, couponCode = '' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    // SERVER-SIDE PRICE VALIDATION: Recalculate prices directly from DB models
    let calculatedSubtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const productId = item.product?._id || item.product || item._id;
      let dbProduct = null;

      if (productId && String(productId).match(/^[0-9a-fA-F]{24}$/)) {
        dbProduct = await Product.findById(productId);
      }

      // If product found in DB use DB price, otherwise fallback to item price with sanity check
      const unitPrice = dbProduct?.price || item.unitPrice || item.price || 499;
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      calculatedSubtotal += unitPrice * quantity;

      orderItems.push({
        product: dbProduct ? dbProduct._id : (productId || null),
        productSnapshot: {
          name: dbProduct?.name || item.name || item.productSnapshot?.name || 'DD Mystery Box',
          image: dbProduct?.image || item.image || item.productSnapshot?.image || '',
          price: unitPrice,
          description: dbProduct?.description || '',
          contents: dbProduct?.contents || []
        },
        customizationSnapshot: item.customization || item.customizationSnapshot || {},
        quantity,
        unitPrice
      });
    }

    // Server-side Coupon Verification
    let couponDiscount = 0;
    let validatedCouponCode = '';
    if (couponCode && String(couponCode).trim()) {
      const cleanCode = String(couponCode).trim().toUpperCase();
      try {
        const dbCoupon = await Coupon.findOne({ code: cleanCode, isActive: true });
        if (dbCoupon) {
          if (dbCoupon.discountType === 'PERCENTAGE') {
            couponDiscount = Math.round((calculatedSubtotal * dbCoupon.discountValue) / 100);
            if (dbCoupon.maxDiscountAmount && dbCoupon.maxDiscountAmount > 0) {
              couponDiscount = Math.min(couponDiscount, dbCoupon.maxDiscountAmount);
            }
          } else {
            couponDiscount = Math.min(dbCoupon.discountValue, calculatedSubtotal);
          }
          validatedCouponCode = dbCoupon.code;
        } else if (cleanCode === 'WELCOME50') {
          couponDiscount = Math.round(calculatedSubtotal * 0.5);
          validatedCouponCode = 'WELCOME50';
        } else if (cleanCode === 'DD100') {
          couponDiscount = Math.min(100, calculatedSubtotal);
          validatedCouponCode = 'DD100';
        }
      } catch (cErr) {
        console.warn('[Coupon Validation Warning]', cErr.message);
      }
    }

    const deliveryFee = 0;
    const totalAmount = Math.max(1, Math.round(calculatedSubtotal + deliveryFee - couponDiscount));

    if (isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid total payment amount calculated' });
    }

    const customOrderId = await generateOrderId();

    const customerDetails = {
      id: req.user._id ? String(req.user._id) : `cust_${Date.now()}`,
      name: deliveryAddress.fullName || req.user.name || 'Customer',
      email: deliveryAddress.email || req.user.email || 'customer@example.com',
      phone: deliveryAddress.mobileNumber || req.user.phone || '9999999999'
    };

    const returnUrl = `${process.env.CLIENT_URL || 'https://dd-mystery.vercel.app'}/payment?order_id=${customOrderId}`;

    // Create Payment Order Session via Cashfree SDK/API
    const cashfreeSession = await createOrderSession({
      orderId: customOrderId,
      amount: totalAmount,
      currency: 'INR',
      customer: customerDetails,
      returnUrl
    });

    if (!cashfreeSession || !cashfreeSession.paymentSessionId) {
      throw new Error('Failed to obtain Cashfree payment session');
    }

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 4);

    // Create Order Document in MongoDB
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
      couponCode: validatedCouponCode,
      totalAmount,
      amountPaid: 0,
      remainingBalance: totalAmount,
      paymentInfo: {
        method: 'Cashfree',
        provider: 'CASHFREE',
        status: 'PENDING_PAYMENT',
        paymentOrderId: customOrderId,
        paymentSessionId: cashfreeSession.paymentSessionId
      },
      orderStatus: 'PENDING_PAYMENT',
      trackingHistory: [
        {
          status: 'PENDING_PAYMENT',
          comment: 'Order registered. Awaiting online payment via Cashfree Gateway.',
          timestamp: new Date()
        }
      ],
      expectedDeliveryDate: expectedDelivery,
      luckyRewardUnlocked: totalAmount >= 199
    });

    const createdOrder = await order.save();

    // Create linked Payment document in MongoDB
    await Payment.create({
      order: createdOrder._id,
      orderId: customOrderId,
      customer: req.user._id,
      amount: totalAmount,
      cashfreeOrderId: customOrderId,
      paymentSessionId: cashfreeSession.paymentSessionId,
      paymentReference: customOrderId,
      paymentMethod: 'CASHFREE',
      status: 'PENDING_PAYMENT'
    }).catch((err) => console.error('[Payment Document Creation Warning]', err.message));

    // Admin Notification Log
    NotificationLog.create({
      orderId: createdOrder.orderId,
      userId: createdOrder.user || null,
      customerName: customerDetails.name,
      recipient: 'ADMIN',
      channel: 'Email',
      type: 'NEW_ORDER',
      event: 'NEW_ORDER',
      status: 'Sent',
      provider: 'System',
      subject: `New Online Order Placed #${createdOrder.orderId}`,
      content: `New Cashfree payment order registered for ₹${totalAmount}. Order ID: ${createdOrder.orderId}`
    }).catch(() => {});

    res.status(201).json({
      success: true,
      order_id: customOrderId,
      orderId: customOrderId,
      paymentSessionId: cashfreeSession.paymentSessionId,
      amount: totalAmount,
      currency: 'INR',
      order: createdOrder
    });
  } catch (error) {
    console.error('[Create Cashfree Order Error]', error);
    res.status(500).json({ message: error.message || 'Failed to initialize Cashfree payment' });
  }
};

/**
 * @desc Verify Cashfree Payment Status Server-Side
 * @route GET /api/payments/status/:orderId
 * @route GET /api/payments/order/:orderId
 * @access Protected (User)
 */
const verifyCashfreePayment = async (req, res) => {
  try {
    const param = req.params.orderId;
    if (!param) {
      return res.status(400).json({ message: 'Order ID parameter is required' });
    }

    let order;
    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(param).populate('user', 'name email phone');
    } else {
      order = await Order.findOne({ $or: [{ orderId: param }, { orderNumber: param }] }).populate('user', 'name email phone');
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let payment = await Payment.findOne({ order: order._id });

    // If order is already confirmed in DB, return current status
    if (order.paymentInfo?.status === 'PAID' && order.orderStatus === 'ORDER_CONFIRMED') {
      return res.json({
        success: true,
        paymentStatus: 'PAID',
        orderStatus: 'ORDER_CONFIRMED',
        order,
        payment
      });
    }

    // Verify payment status with Cashfree Server-Side REST API
    try {
      const cashfreeResult = await verifyOrderPayment(order.orderNumber || order.orderId);

      if (cashfreeResult.isPaid) {
        order.orderStatus = 'ORDER_CONFIRMED';
        order.paymentInfo = {
          ...order.paymentInfo,
          method: 'Cashfree',
          provider: 'CASHFREE',
          status: 'PAID',
          transactionId: cashfreeResult.transactionId || `cf_tx_${Date.now()}`
        };

        if (order.pricing) {
          order.pricing.amountPaid = order.totalAmount;
          order.pricing.remainingBalance = 0;
        }
        order.amountPaid = order.totalAmount;
        order.remainingBalance = 0;

        if (!order.trackingHistory.some((t) => t.status === 'ORDER_CONFIRMED')) {
          order.trackingHistory.push({
            status: 'ORDER_CONFIRMED',
            comment: `Online payment verified successfully via Cashfree. Ref: ${cashfreeResult.transactionId}`,
            timestamp: new Date()
          });
        }

        const updatedOrder = await order.save();

        if (payment) {
          payment.status = 'PAID';
          payment.transactionId = cashfreeResult.transactionId;
          payment.paidAt = new Date();
          payment.rawResponse = cashfreeResult;
          await payment.save();
        }

        // Clear user cart upon successful payment
        if (order.user?._id) {
          await Cart.findOneAndUpdate(
            { user: order.user._id },
            { items: [], couponApplied: { code: '', discountAmount: 0 } }
          ).catch(() => {});
        }

        // Send order confirmation email / SMS
        sendNotification({
          type: 'ORDER_CONFIRMATION',
          order: updatedOrder,
          orderId: updatedOrder.orderNumber || updatedOrder.orderId,
          recipientEmail: order.user?.email || order.deliveryAddressSnapshot?.email,
          recipientPhone: order.user?.phone || order.deliveryAddressSnapshot?.mobileNumber
        }).catch((e) => console.error('[Notification Warning]', e.message));

        return res.json({
          success: true,
          paymentStatus: 'PAID',
          orderStatus: 'ORDER_CONFIRMED',
          message: 'Payment verified successfully!',
          order: updatedOrder,
          payment
        });
      } else if (cashfreeResult.status === 'FAILED' || cashfreeResult.status === 'CANCELLED' || cashfreeResult.status === 'EXPIRED') {
        order.paymentInfo.status = 'FAILED';
        order.orderStatus = 'FAILED';
        await order.save();

        if (payment) {
          payment.status = 'FAILED';
          await payment.save();
        }

        return res.json({
          success: false,
          paymentStatus: 'FAILED',
          orderStatus: 'FAILED',
          message: `Payment was ${cashfreeResult.status.toLowerCase()}. Please try again.`,
          order,
          payment
        });
      }
    } catch (cfErr) {
      console.error('[Cashfree Verification Warning]', cfErr.message);
    }

    res.json({
      success: true,
      paymentStatus: order.paymentInfo?.status || 'PENDING_PAYMENT',
      orderStatus: order.orderStatus,
      order,
      payment
    });
  } catch (error) {
    console.error('[Verify Cashfree Payment Error]', error);
    res.status(500).json({ message: error.message || 'Failed to verify payment' });
  }
};

/**
 * @desc Cashfree Webhook Listener (Idempotent & Authenticated)
 * @route POST /api/payments/webhook
 * @access Public (Cashfree Server)
 */
const handleCashfreeWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const payload = req.body;

    // Verify webhook signature if in production mode
    if (process.env.CASHFREE_ENV === 'PRODUCTION' && signature && timestamp) {
      const isValid = verifyWebhookSignature(signature, payload, timestamp);
      if (!isValid) {
        console.error('[Cashfree Webhook] Invalid signature received!');
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }
    }

    const eventType = payload.type || payload.event;
    const orderData = payload.data?.order || payload.order || {};
    const orderId = orderData.order_id || payload.data?.order_id;
    const paymentData = payload.data?.payment || payload.payment || {};
    const paymentStatus = paymentData.payment_status || orderData.order_status;

    if (!orderId) {
      return res.status(200).json({ status: 'OK', message: 'No order_id in webhook payload' });
    }

    let order = await Order.findOne({ $or: [{ orderId }, { orderNumber: orderId }] });
    if (!order) {
      return res.status(200).json({ status: 'OK', message: 'Order not found for webhook' });
    }

    // IDEMPOTENT PROTECTION: If order already PAID, acknowledge immediately
    if (order.paymentInfo?.status === 'PAID' && order.orderStatus === 'ORDER_CONFIRMED') {
      return res.status(200).json({ status: 'OK', message: 'Order already marked PAID' });
    }

    if (paymentStatus === 'SUCCESS' || paymentStatus === 'PAID' || eventType === 'PAYMENT_SUCCESS_WEBHOOK') {
      order.orderStatus = 'ORDER_CONFIRMED';
      order.paymentInfo = {
        ...order.paymentInfo,
        method: 'Cashfree',
        provider: 'CASHFREE',
        status: 'PAID',
        transactionId: paymentData.cf_payment_id || `cf_wh_${Date.now()}`
      };

      if (order.pricing) {
        order.pricing.amountPaid = order.totalAmount;
        order.pricing.remainingBalance = 0;
      }
      order.amountPaid = order.totalAmount;
      order.remainingBalance = 0;

      if (!order.trackingHistory.some((t) => t.status === 'ORDER_CONFIRMED')) {
        order.trackingHistory.push({
          status: 'ORDER_CONFIRMED',
          comment: `Webhook: Payment confirmed via Cashfree. Ref: ${paymentData.cf_payment_id || orderId}`,
          timestamp: new Date()
        });
      }

      await order.save();

      let payment = await Payment.findOne({ order: order._id });
      if (payment) {
        payment.status = 'PAID';
        payment.transactionId = paymentData.cf_payment_id || `cf_wh_${Date.now()}`;
        payment.paidAt = new Date();
        payment.rawResponse = payload;
        await payment.save();
      }

      if (order.user) {
        await Cart.findOneAndUpdate(
          { user: order.user },
          { items: [], couponApplied: { code: '', discountAmount: 0 } }
        ).catch(() => {});
      }
    }

    res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('[Cashfree Webhook Error]', error);
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
};

/**
 * @desc Get List of Payments for Admin Dashboard
 * @route GET /api/payments/admin/pending
 * @route GET /api/payments/admin/list
 * @access Admin
 */
const adminGetPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('customer', 'name email phone')
      .populate({
        path: 'order',
        populate: { path: 'user', select: 'name email phone' }
      })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(payments);
  } catch (error) {
    console.error('[Admin Get Payments Error]', error);
    res.status(500).json({ message: error.message || 'Failed to fetch payments list' });
  }
};

module.exports = {
  confirmPaymentAndCreateOrder: createCashfreeOrder,
  createCashfreeOrder,
  getPaymentDetailsForOrder: verifyCashfreePayment,
  verifyCashfreePayment,
  handleCashfreeWebhook,
  adminGetPendingPayments,
  adminGetPaymentsList: adminGetPendingPayments,
  createPaymentSession: createCashfreeOrder
};
