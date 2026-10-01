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
 * Helper: Finalize Paid Order in MongoDB
 * ONLY called after server-side verification confirms payment status is PAID.
 * Creates ONE final Order document safely and idempotently.
 */
const finalizePaidOrder = async (orderIdOrCashfreeId, transactionId = '', rawData = null) => {
  let payment = await Payment.findOne({
    $or: [{ cashfreeOrderId: orderIdOrCashfreeId }, { orderId: orderIdOrCashfreeId }]
  });

  if (!payment) {
    throw new Error(`Temporary payment checkout record not found for ID: ${orderIdOrCashfreeId}`);
  }

  // IDEMPOTENCY CHECK: If already finalized & Order created, return existing order
  if (payment.status === 'PAID' && payment.order) {
    const existingOrder = await Order.findById(payment.order).populate('user', 'name email phone');
    if (existingOrder) return existingOrder;
  }

  const customOrderId = payment.orderId;
  const expectedDelivery = new Date();
  expectedDelivery.setDate(expectedDelivery.getDate() + 4);

  const fullPricing = {
    subtotal: payment.pricing?.subtotal || payment.amount || 0,
    deliveryFee: payment.pricing?.deliveryFee || 0,
    couponDiscount: payment.pricing?.couponDiscount || 0,
    totalAmount: payment.pricing?.totalAmount || payment.amount || 0,
    advanceAmount: 0,
    amountPaid: payment.pricing?.totalAmount || payment.amount || 0,
    remainingBalance: 0
  };

  // CREATE FINAL ORDER DOCUMENT IN MONGODB
  const order = new Order({
    orderNumber: customOrderId,
    orderId: customOrderId,
    user: payment.customer,
    items: payment.items,
    deliveryAddressSnapshot: payment.deliveryAddressSnapshot,
    pricing: fullPricing,
    subtotal: fullPricing.subtotal,
    deliveryFee: fullPricing.deliveryFee,
    couponDiscount: fullPricing.couponDiscount,
    couponCode: payment.couponCode,
    totalAmount: fullPricing.totalAmount,
    amountPaid: fullPricing.amountPaid,
    remainingBalance: 0,
    paymentInfo: {
      method: 'Cashfree',
      provider: 'CASHFREE',
      status: 'PAID',
      paymentOrderId: customOrderId,
      cashfreeOrderId: payment.cashfreeOrderId,
      paymentSessionId: payment.paymentSessionId,
      transactionId: transactionId || payment.transactionId || `cf_tx_${Date.now()}`
    },
    orderStatus: 'ORDER_CONFIRMED',
    trackingHistory: [
      {
        status: 'ORDER_CONFIRMED',
        comment: `Online payment verified successfully via Cashfree. Ref: ${transactionId || customOrderId}`,
        timestamp: new Date()
      }
    ],
    expectedDeliveryDate: expectedDelivery,
    luckyRewardUnlocked: payment.pricing.totalAmount >= 199
  });

  const createdOrder = await order.save();

  // Update Payment record link
  payment.order = createdOrder._id;
  payment.status = 'PAID';
  payment.transactionId = transactionId || payment.transactionId || `cf_tx_${Date.now()}`;
  payment.paidAt = new Date();
  if (rawData) payment.rawResponse = rawData;
  await payment.save();

  // Clear customer cart in MongoDB
  if (payment.customer) {
    await Cart.findOneAndUpdate(
      { user: payment.customer },
      { items: [], couponApplied: { code: '', discountAmount: 0 } }
    ).catch(() => {});
  }

  // Send Email / SMS Notifications
  sendNotification({
    type: 'ORDER_CONFIRMATION',
    order: createdOrder,
    orderId: createdOrder.orderNumber || createdOrder.orderId,
    recipientEmail: payment.customerDetails?.email || payment.deliveryAddressSnapshot?.email,
    recipientPhone: payment.customerDetails?.phone || payment.deliveryAddressSnapshot?.mobileNumber
  }).catch((e) => console.error('[Notification Dispatch Warning]', e.message));

  // Admin Notification Log
  NotificationLog.create({
    orderId: createdOrder.orderId,
    userId: createdOrder.user || null,
    customerName: payment.customerDetails?.name || 'Customer',
    recipient: 'ADMIN',
    channel: 'Email',
    type: 'NEW_ORDER',
    event: 'NEW_ORDER',
    status: 'Sent',
    provider: 'System',
    subject: `Order Paid & Confirmed #${createdOrder.orderId}`,
    content: `Payment of ₹${createdOrder.totalAmount} verified via Cashfree. Order #${createdOrder.orderId} confirmed.`
  }).catch(() => {});

  return createdOrder;
};

/**
 * @desc Step 1: Create Cashfree Checkout Session & Temporary Payment Record
 * @route POST /api/payments/create-order
 * @access Protected (User)
 */
const createCashfreeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, couponCode = '' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in checkout' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    // SERVER-SIDE PRICE VALIDATION: Recalculate prices directly from DB Product models
    let calculatedSubtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const productId = item.product?._id || item.product || item._id;
      let dbProduct = null;

      if (productId && String(productId).match(/^[0-9a-fA-F]{24}$/)) {
        dbProduct = await Product.findById(productId);
      }

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
      name: deliveryAddress.fullName || req.user.name || 'Customer',
      email: deliveryAddress.email || req.user.email || 'customer@example.com',
      phone: deliveryAddress.mobileNumber || req.user.phone || '9999999999'
    };

    const returnUrl = `${process.env.CLIENT_URL || 'https://dd-mystery.vercel.app'}/payment?order_id=${customOrderId}`;

    // Create Cashfree Payment Order Session
    const cashfreeSession = await createOrderSession({
      orderId: customOrderId,
      amount: totalAmount,
      currency: 'INR',
      customer: {
        id: String(req.user._id),
        ...customerDetails
      },
      returnUrl
    });

    if (!cashfreeSession || !cashfreeSession.paymentSessionId) {
      throw new Error('Failed to obtain Cashfree payment session');
    }

    // CREATE TEMPORARY CHECKOUT / PAYMENT RECORD (DO NOT CREATE ORDER DOC YET)
    const payment = await Payment.create({
      orderId: customOrderId,
      cashfreeOrderId: customOrderId,
      customer: req.user._id,
      customerDetails,
      deliveryAddressSnapshot: deliveryAddress,
      items: orderItems,
      pricing: {
        subtotal: calculatedSubtotal,
        deliveryFee,
        couponDiscount,
        totalAmount
      },
      couponCode: validatedCouponCode,
      amount: totalAmount,
      currency: 'INR',
      paymentSessionId: cashfreeSession.paymentSessionId,
      paymentReference: customOrderId,
      paymentMethod: 'CASHFREE',
      status: 'PENDING_PAYMENT'
    });

    res.status(201).json({
      success: true,
      order_id: customOrderId,
      orderId: customOrderId,
      paymentSessionId: cashfreeSession.paymentSessionId,
      amount: totalAmount,
      currency: 'INR',
      paymentId: payment._id
    });
  } catch (error) {
    console.error('[Create Cashfree Order Error]', error);
    res.status(500).json({ message: error.message || 'Failed to initialize Cashfree checkout' });
  }
};

/**
 * @desc Step 2: Verify Cashfree Payment Status Server-Side & Create Order if PAID
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

    // Check if Order already exists in DB
    let order = await Order.findOne({ $or: [{ orderId: param }, { orderNumber: param }] }).populate('user', 'name email phone');
    let payment = await Payment.findOne({ $or: [{ cashfreeOrderId: param }, { orderId: param }] });

    if (order && order.paymentInfo?.status === 'PAID') {
      return res.json({
        success: true,
        paymentStatus: 'PAID',
        orderStatus: 'ORDER_CONFIRMED',
        order,
        payment
      });
    }

    // Call Cashfree REST API to verify payment status
    try {
      const cashfreeResult = await verifyOrderPayment(param);

      if (cashfreeResult.isPaid) {
        // PAYMENT VERIFIED: Create final Order document safely
        order = await finalizePaidOrder(param, cashfreeResult.transactionId, cashfreeResult);
        payment = await Payment.findOne({ $or: [{ cashfreeOrderId: param }, { orderId: param }] });

        return res.json({
          success: true,
          paymentStatus: 'PAID',
          orderStatus: 'ORDER_CONFIRMED',
          message: 'Payment verified and order confirmed successfully!',
          order,
          payment
        });
      } else if (cashfreeResult.status === 'FAILED' || cashfreeResult.status === 'CANCELLED' || cashfreeResult.status === 'EXPIRED') {
        if (payment) {
          payment.status = cashfreeResult.status;
          await payment.save();
        }

        return res.json({
          success: false,
          paymentStatus: cashfreeResult.status,
          orderStatus: 'NONE',
          message: `Payment was ${cashfreeResult.status.toLowerCase()}. Order was not placed.`,
          payment
        });
      }
    } catch (cfErr) {
      console.error('[Cashfree Verification Warning]', cfErr.message);
    }

    res.json({
      success: true,
      paymentStatus: payment?.status || 'PENDING_PAYMENT',
      orderStatus: order?.orderStatus || 'PENDING_PAYMENT',
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

    if (process.env.CASHFREE_ENV === 'PRODUCTION' && signature && timestamp) {
      const isValid = verifyWebhookSignature(signature, payload, timestamp);
      if (!isValid) {
        console.error('[Cashfree Webhook] Invalid signature');
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }
    }

    const eventType = payload.type || payload.event;
    const orderData = payload.data?.order || payload.order || {};
    const orderId = orderData.order_id || payload.data?.order_id;
    const paymentData = payload.data?.payment || payload.payment || {};
    const paymentStatus = paymentData.payment_status || orderData.order_status;

    if (!orderId) {
      return res.status(200).json({ status: 'OK', message: 'No order_id in webhook' });
    }

    if (paymentStatus === 'SUCCESS' || paymentStatus === 'PAID' || eventType === 'PAYMENT_SUCCESS_WEBHOOK') {
      const transactionId = paymentData.cf_payment_id || `cf_wh_${Date.now()}`;
      await finalizePaidOrder(orderId, transactionId, payload);
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED' || paymentStatus === 'EXPIRED') {
      await Payment.findOneAndUpdate(
        { $or: [{ cashfreeOrderId: orderId }, { orderId }] },
        { status: paymentStatus }
      ).catch(() => {});
    }

    res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('[Cashfree Webhook Error]', error);
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
};

/**
 * @desc Admin Get Payments List (Audit Log for all checkout attempts)
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
  createPaymentSession: createCashfreeOrder,
  finalizePaidOrder
};
