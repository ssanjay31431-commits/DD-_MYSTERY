const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Payment = require('../models/Payment');
const NotificationLog = require('../models/NotificationLog');
const { generateOrderId } = require('../utils/orderIdGenerator');
const { sendNotification } = require('../utils/emailService');
const { cashfreeRequest, getCashfreeConfig } = require('../config/cashfree');

// Helper to format clean 10-digit phone number for Cashfree API requirements
const formatPhoneForCashfree = (phoneStr) => {
  if (!phoneStr) return '9876543210';
  const digits = String(phoneStr).replace(/[^\d]/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return '9876543210';
};

// @desc Create Cashfree Payment Order
// @route POST /api/payments/create-order
const createCashfreeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, subtotal, deliveryFee = 0, couponDiscount = 0, couponCode = '', totalAmount: reqTotalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    // 1. Calculate Order Total on Backend for Security
    const calculatedSubtotal = items.reduce((acc, item) => {
      const price = item.unitPrice || item.product?.price || item.price || 0;
      return acc + price * (item.quantity || 1);
    }, 0);

    const totalAmount = Math.max(1, Math.round(calculatedSubtotal + deliveryFee - couponDiscount));

    if (isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid total payment amount' });
    }

    const customOrderId = await generateOrderId();
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

    // Save initial Order in MongoDB with status PENDING_PAYMENT
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
        method: 'Cashfree',
        provider: 'CASHFREE',
        status: 'PENDING_PAYMENT',
        paymentOrderId: customOrderId
      },
      orderStatus: 'PENDING_PAYMENT',
      trackingHistory: [
        {
          status: 'PENDING_PAYMENT',
          comment: 'Cashfree payment session initialized. Awaiting customer checkout.',
          timestamp: new Date()
        }
      ],
      expectedDeliveryDate: expectedDelivery,
      luckyRewardUnlocked: totalAmount >= 199
    });

    const createdOrder = await order.save();

    // 2. Prepare Cashfree Customer Details
    const customerPhone = formatPhoneForCashfree(deliveryAddress.mobileNumber || req.user.phone);
    const customerName = (deliveryAddress.fullName || req.user.name || 'Customer').trim();
    const customerEmail = (deliveryAddress.email || req.user.email || 'customer@ddmysterybox.com').trim();
    const customerId = `cust_${req.user._id.toString()}`;

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // 3. Call Cashfree Create Order API
    const cashfreeOrderPayload = {
      order_id: customOrderId,
      order_amount: totalAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      },
      order_meta: {
        return_url: `${clientUrl}/order-success/${customOrderId}?order_id={order_id}`
      }
    };

    console.log(`[Cashfree] Creating Cashfree order ${customOrderId} for ₹${totalAmount}...`);
    const cfResponse = await cashfreeRequest('POST', '/orders', cashfreeOrderPayload);

    if (!cfResponse || !cfResponse.payment_session_id) {
      throw new Error('Cashfree order creation failed: missing payment_session_id');
    }

    // Save linked Payment record
    await Payment.create({
      order: createdOrder._id,
      orderId: customOrderId,
      customer: req.user._id,
      amount: totalAmount,
      paymentReference: cfResponse.cf_order_id || customOrderId,
      status: 'PENDING_PAYMENT'
    }).catch(err => console.error('[Payment Record Warning]', err.message));

    res.status(201).json({
      success: true,
      payment_session_id: cfResponse.payment_session_id,
      order_id: customOrderId,
      orderMongoId: createdOrder._id,
      amount: totalAmount,
      order: createdOrder
    });
  } catch (error) {
    console.error('[Create Cashfree Order Error]', error);
    res.status(error.status || 500).json({
      message: error.message || 'Failed to create Cashfree payment order',
      details: error.data || null
    });
  }
};

// @desc Verify Cashfree Payment Status via Backend
// @route GET /api/payments/status/:orderId
const verifyCashfreePayment = async (req, res) => {
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

    const displayOrderId = order.orderNumber || order.orderId;

    // Check if order is already confirmed in DB
    if (order.orderStatus === 'ORDER_CONFIRMED' || order.orderStatus === 'CONFIRMED' || order.paymentInfo?.status === 'SUCCESS') {
      return res.json({
        success: true,
        paymentStatus: 'SUCCESS',
        orderStatus: order.orderStatus,
        order
      });
    }

    // Fetch actual Cashfree order status from Cashfree REST API
    let cfOrder;
    let cfPayments = [];
    try {
      cfOrder = await cashfreeRequest('GET', `/orders/${displayOrderId}`);
      try {
        cfPayments = await cashfreeRequest('GET', `/orders/${displayOrderId}/payments`);
      } catch (e) {
        console.warn(`[Cashfree Payments Fetch Notice] ${displayOrderId}:`, e.message);
      }
    } catch (cfErr) {
      console.error(`[Cashfree Order Fetch Error] ${displayOrderId}:`, cfErr.message);
      return res.json({
        success: false,
        paymentStatus: 'PENDING',
        orderStatus: order.orderStatus,
        message: 'Payment verification is processing. Please check again in a moment.'
      });
    }

    const cfOrderStatus = cfOrder?.order_status || '';
    const hasSuccessfulPayment = Array.isArray(cfPayments) && cfPayments.some(p => p.payment_status === 'SUCCESS');

    if (cfOrderStatus === 'PAID' || hasSuccessfulPayment) {
      // Mark order as CONFIRMED & PAID in MongoDB
      order.orderStatus = 'ORDER_CONFIRMED';
      order.paymentInfo = {
        method: 'Cashfree',
        provider: 'CASHFREE',
        status: 'SUCCESS',
        transactionId: cfPayments?.[0]?.cf_payment_id || `CF_${Date.now()}`,
        paymentOrderId: displayOrderId
      };

      if (order.pricing) {
        order.pricing.amountPaid = order.totalAmount;
        order.pricing.remainingBalance = 0;
      }
      order.amountPaid = order.totalAmount;
      order.advancePaid = order.totalAmount;
      order.remainingBalance = 0;
      order.remainingCodAmount = 0;

      if (!order.trackingHistory.some(t => t.status === 'ORDER_CONFIRMED')) {
        order.trackingHistory.push({
          status: 'ORDER_CONFIRMED',
          comment: 'Payment verified successfully powered by Cashfree Payment Gateway.',
          timestamp: new Date()
        });
      }

      const updatedOrder = await order.save();

      // Update linked Payment model
      await Payment.findOneAndUpdate(
        { order: order._id },
        { status: 'PAYMENT_COMPLETED', verifiedAt: new Date() }
      ).catch(e => {});

      // Clear user cart
      if (order.user?._id) {
        await Cart.findOneAndUpdate(
          { user: order.user._id },
          { items: [], couponApplied: { code: '', discountAmount: 0 } }
        ).catch(e => {});
      }

      // Dispatch order confirmation notification
      try {
        await sendNotification({
          type: 'ORDER_CONFIRMATION',
          order: updatedOrder,
          orderId: displayOrderId,
          recipientEmail: order.user?.email || order.deliveryAddressSnapshot?.email,
          recipientPhone: order.user?.phone || order.deliveryAddressSnapshot?.mobileNumber
        });
      } catch (e) {
        console.error('[Notification Warning]', e.message);
      }

      return res.json({
        success: true,
        paymentStatus: 'SUCCESS',
        orderStatus: 'ORDER_CONFIRMED',
        order: updatedOrder
      });
    } else if (cfOrderStatus === 'ACTIVE') {
      return res.json({
        success: false,
        paymentStatus: 'PENDING',
        orderStatus: order.orderStatus,
        message: 'Payment is pending. Please complete checkout.'
      });
    } else {
      // Payment Failed / Cancelled / Expired
      order.orderStatus = 'PAYMENT_FAILED';
      if (order.paymentInfo) {
        order.paymentInfo.status = 'FAILED';
      }
      await order.save();

      await Payment.findOneAndUpdate(
        { order: order._id },
        { status: 'FAILED' }
      ).catch(e => {});

      return res.json({
        success: false,
        paymentStatus: 'FAILED',
        orderStatus: 'PAYMENT_FAILED',
        message: 'Payment failed or was cancelled by user.'
      });
    }
  } catch (error) {
    console.error('[Verify Cashfree Payment Error]', error);
    res.status(500).json({ message: error.message || 'Payment verification failed' });
  }
};

// @desc Cashfree Webhook Handler
// @route POST /api/payments/webhook
const handleCashfreeWebhook = async (req, res) => {
  try {
    const rawBody = req.body;
    console.log('[Cashfree Webhook Received]:', JSON.stringify(rawBody));

    const orderId = rawBody?.data?.order?.order_id;
    const paymentStatus = rawBody?.data?.payment?.payment_status;

    if (orderId && paymentStatus === 'SUCCESS') {
      const order = await Order.findOne({ $or: [{ orderId }, { orderNumber: orderId }] });
      if (order && order.orderStatus !== 'ORDER_CONFIRMED') {
        order.orderStatus = 'ORDER_CONFIRMED';
        order.paymentInfo = {
          method: 'Cashfree',
          provider: 'CASHFREE',
          status: 'SUCCESS',
          transactionId: rawBody.data.payment.cf_payment_id || `CF_${Date.now()}`
        };
        order.amountPaid = order.totalAmount;
        order.remainingBalance = 0;
        await order.save();

        await Payment.findOneAndUpdate({ order: order._id }, { status: 'PAYMENT_COMPLETED', verifiedAt: new Date() });
      }
    }

    res.status(200).json({ status: 'OK' });
  } catch (error) {
    console.error('[Cashfree Webhook Error]', error);
    res.status(500).json({ message: 'Webhook processing error' });
  }
};

// @desc Get Payment Status Log for Admin
// @route GET /api/payments/admin/pending
const adminGetPaymentsList = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('customer', 'name email phone')
      .populate('order')
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch payments' });
  }
};

module.exports = {
  createCashfreeOrder,
  verifyCashfreePayment,
  handleCashfreeWebhook,
  adminGetPaymentsList,
  // Compatibility exports
  createPaymentSession: createCashfreeOrder,
  confirmPaymentAndCreateOrder: createCashfreeOrder
};
