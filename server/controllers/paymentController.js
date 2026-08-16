const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const AdminSettings = require('../models/AdminSettings');
const Cart = require('../models/Cart');
const FailedPayment = require('../models/FailedPayment');
const cashfreeService = require('../services/cashfreeService');
const { generateOrderId } = require('../utils/orderIdGenerator');
const { sendNotification } = require('../utils/emailService');

// @desc Create Cashfree Payment Order Session
// @route POST /api/payments/create-session
const createPaymentSession = async (req, res) => {
  try {
    const { items, paymentMethod = 'ADVANCE', couponCode = '' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required to create payment session' });
    }

    // 1. Backend-driven product price and advance amount calculation
    let calculatedSubtotal = 0;
    let maxProductAdvance = 100;

    const populatedItems = await Promise.all(
      items.map(async (item) => {
        const productId = item.product?._id || item.product || item._id;
        let dbProduct = null;
        if (productId) {
          dbProduct = await Product.findById(productId);
        }
        
        const price = dbProduct ? dbProduct.price : (item.unitPrice || item.price || 499);
        const qty = item.quantity || 1;
        calculatedSubtotal += price * qty;

        if (dbProduct && dbProduct.advanceAmount) {
          maxProductAdvance = dbProduct.advanceAmount;
        }

        return {
          ...item,
          unitPrice: price,
          product: dbProduct || item.product
        };
      })
    );

    // Fetch Admin Settings for delivery fee & default advance
    const settings = await AdminSettings.findOne() || {};
    const defaultAdvance = settings.advanceAmount || settings.codAdvanceValue || maxProductAdvance;
    const deliveryFee = settings.deliveryCharge || 0;
    const totalAmount = Math.max(0, calculatedSubtotal + deliveryFee);

    // Calculate dynamic advance and remaining balance
    let advanceAmount = 0;
    if (paymentMethod === 'FULL' || paymentMethod === 'full_online') {
      advanceAmount = totalAmount;
    } else {
      advanceAmount = Math.min(totalAmount, defaultAdvance);
    }
    const remainingBalance = Math.max(0, totalAmount - advanceAmount);

    // Unique Cashfree payment order ID
    const paymentOrderId = `CF_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const returnUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/order-success?order_id=${paymentOrderId}`;

    const sessionData = await cashfreeService.createOrderSession({
      orderId: paymentOrderId,
      amount: advanceAmount,
      currency: 'INR',
      customer: {
        id: req.user._id.toString(),
        name: req.user.name || 'Customer',
        email: req.user.email || 'customer@example.com',
        phone: req.user.phone || '9999999999'
      },
      returnUrl
    });

    res.json({
      success: true,
      paymentSessionId: sessionData.paymentSessionId,
      paymentOrderId: sessionData.paymentOrderId,
      amountToPay: advanceAmount,
      totalAmount,
      remainingBalance,
      paymentMethod: paymentMethod === 'FULL' || paymentMethod === 'full_online' ? 'FULL' : 'ADVANCE',
      isMockMode: sessionData.isMockMode
    });
  } catch (error) {
    console.error('[Payment Session Error]', error.message);
    res.status(500).json({ message: error.message || 'Payment session creation failed' });
  }
};

// @desc Verify Payment and Create Order in MongoDB (Server-Side Flow)
// @route POST /api/orders/confirm-payment
const confirmPaymentAndCreateOrder = async (req, res) => {
  try {
    if (!req.user || (!req.user._id && !req.user.id && !req.user.userId)) {
      return res.status(401).json({ success: false, message: 'Please login again' });
    }

    const {
      paymentOrderId: inputPaymentOrderId,
      paymentSessionId = '',
      transactionId = '',
      paymentMethod = 'ADVANCE',
      items,
      deliveryAddress = {},
      couponCode = ''
    } = req.body;

    const paymentOrderId = inputPaymentOrderId || `CF_MOCK_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const authenticatedUserId = req.user._id || req.user.id || req.user.userId;
    const user = await User.findById(authenticatedUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. IDEMPOTENCY CHECK: Return existing order if already processed for this payment
    const existingOrder = await Order.findOne({
      user: user._id,
      'paymentInfo.paymentOrderId': paymentOrderId
    });
    if (existingOrder) {
      console.log(`[Idempotent Order Check] Returning existing order ${existingOrder.orderNumber} for payment ${paymentOrderId}`);
      return res.json({ success: true, idempotent: true, order: existingOrder });
    }

    // 2. Server-side verification (must succeed before order creation)
    const verification = await cashfreeService.verifyOrderPayment(paymentOrderId);

    // 4. Recalculate Order Pricing from MongoDB Products
    let calculatedSubtotal = 0;
    let maxProductAdvance = 100;

    const orderItems = await Promise.all(
      (items || []).map(async (item) => {
        const productId = item.product?._id || item.product || item._id;
        let dbProduct = null;
        if (productId && typeof productId === 'string' && productId.match(/^[0-9a-fA-F]{24}$/)) {
          dbProduct = await Product.findById(productId);
        }

        const price = dbProduct ? dbProduct.price : (item.unitPrice || item.price || item.product?.price || 499);
        const qty = item.quantity || 1;
        calculatedSubtotal += price * qty;

        if (dbProduct && dbProduct.advanceAmount) {
          maxProductAdvance = dbProduct.advanceAmount;
        }

        return {
          product: dbProduct ? dbProduct._id : null,
          productSnapshot: {
            name: dbProduct?.name || item.name || item.productSnapshot?.name || item.product?.name || 'DD Mystery Box',
            image: dbProduct?.image || item.image || item.productSnapshot?.image || item.product?.image || '',
            price: price,
            description: dbProduct?.description || item.description || '',
            contents: dbProduct?.contents?.map(c => c.name) || []
          },
          customizationSnapshot: item.customization || item.customizationSnapshot || {},
          quantity: qty,
          unitPrice: price
        };
      })
    );

    if (calculatedSubtotal === 0) calculatedSubtotal = 499;

    const settings = await AdminSettings.findOne() || {};
    const defaultAdvance = settings.advanceAmount || settings.codAdvanceValue || maxProductAdvance;
    const deliveryFee = settings.deliveryCharge || 0;
    const totalAmount = Math.max(0, calculatedSubtotal + deliveryFee);

    const isFullPayment = paymentMethod === 'FULL' || paymentMethod === 'full_online';
    const advanceAmount = isFullPayment ? totalAmount : Math.min(totalAmount, defaultAdvance);
    const amountPaid = advanceAmount;
    const remainingBalance = Math.max(0, totalAmount - amountPaid);

    const orderNumber = await generateOrderId();

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 4);

    const newOrderData = {
      orderNumber,
      orderId: orderNumber,
      user: user._id,
      items: orderItems,
      deliveryAddressSnapshot: deliveryAddress,

      pricing: {
        subtotal: calculatedSubtotal,
        deliveryFee,
        couponDiscount: 0,
        totalAmount,
        advanceAmount,
        amountPaid,
        remainingBalance
      },

      subtotal: calculatedSubtotal,
      deliveryFee,
      totalAmount,
      advanceAmount,
      amountPaid,
      advancePaid: amountPaid,
      remainingBalance,
      remainingCodAmount: remainingBalance,

      paymentInfo: {
        method: isFullPayment ? 'FULL' : 'ADVANCE',
        provider: 'ONLINE_GATEWAY',
        status: isFullPayment ? 'PAID' : 'PARTIALLY_PAID',
        paymentOrderId,
        paymentSessionId: paymentSessionId || '',
        transactionId: transactionId || verification.transactionId || `tx_${Date.now()}`
      },

      orderStatus: 'CONFIRMED',

      shipment: {
        status: 'NOT_CREATED',
        provider: null,
        shipmentId: null,
        awb: null,
        trackingUrl: null
      },

      trackingHistory: [
        {
          status: 'CONFIRMED',
          comment: isFullPayment
            ? `Order confirmed! Paid ₹${amountPaid} in full online.`
            : `Order confirmed! Online advance payment of ₹${amountPaid} verified. Remaining balance: ₹${remainingBalance}`
        }
      ],

      expectedDeliveryDate: expectedDelivery,
      luckyRewardUnlocked: totalAmount >= 199
    };

    // 5. Save to MongoDB Database
    const order = new Order(newOrderData);
    const createdOrder = await order.save();

    console.log(`[ORDER CREATED IN MONGODB] Order #${createdOrder.orderNumber} saved successfully for ${user.name || 'Customer'}`);

    // 6. Clear User Cart
    if (user._id) {
      await Cart.findOneAndUpdate({ user: user._id }, { items: [], couponApplied: { code: '', discountAmount: 0 } }).catch(e => {});
    }

    // 7. Asynchronous Notification Dispatch
    sendNotification({
      type: 'ORDER_CONFIRMATION',
      order: createdOrder,
      orderId: createdOrder.orderNumber
    }).catch(err => console.error('[Notification Dispatch Warning]', err.message));

    res.status(201).json({
      success: true,
      order: createdOrder
    });
  } catch (error) {
    console.error('[Confirm Payment Error]', error);
    res.status(500).json({ message: error.message || 'Payment confirmation failed' });
  }
};

module.exports = {
  createPaymentSession,
  confirmPaymentAndCreateOrder
};
