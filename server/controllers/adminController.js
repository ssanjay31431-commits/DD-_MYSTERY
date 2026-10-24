const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Theme = require('../models/Theme');
const Inventory = require('../models/Inventory');
const NotificationLog = require('../models/NotificationLog');
const { sendNotification } = require('../utils/emailService');

const FailedPayment = require('../models/FailedPayment');
const { generateOrderId } = require('../utils/orderIdGenerator');

// @desc Get Admin Dashboard Analytics Summary directly from MongoDB
// @route GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const excludedRevenueStatuses = ['Cancelled', 'CANCELLED', 'PENDING_PAYMENT'];
    const excludedOpenBalanceStatuses = [
      'Cancelled', 'CANCELLED', 'Delivered', 'DELIVERED', 'PENDING_PAYMENT'
    ];
    const validRevenueOrder = {
      $not: [{ $in: ['$orderStatus', excludedRevenueStatuses] }]
    };
    const validOpenBalanceOrder = {
      $not: [{ $in: ['$orderStatus', excludedOpenBalanceStatuses] }]
    };
    const createdToday = { $gte: ['$createdAt', todayStart] };

    const [metrics, totalCustomers, recentOrders, unresolvedFailedPayments] = await Promise.all([
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: { $cond: [validRevenueOrder, 1, 0] } },
            todayOrders: {
              $sum: { $cond: [{ $and: [validRevenueOrder, createdToday] }, 1, 0] }
            },
            pendingOrders: {
              $sum: {
                $cond: [
                  { $not: [{ $in: ['$orderStatus', ['Delivered', 'DELIVERED', ...excludedRevenueStatuses]] }] },
                  1,
                  0
                ]
              }
            },
            deliveredOrders: {
              $sum: { $cond: [{ $in: ['$orderStatus', ['Delivered', 'DELIVERED']] }, 1, 0] }
            },
            totalRevenue: {
              $sum: { $cond: [validRevenueOrder, { $ifNull: ['$totalAmount', 0] }, 0] }
            },
            advanceCollected: {
              $sum: {
                $cond: [
                  validRevenueOrder,
                  { $ifNull: ['$amountPaid', { $ifNull: ['$advancePaid', 0] }] },
                  0
                ]
              }
            },
            remainingBalanceCollection: {
              $sum: {
                $cond: [
                  validOpenBalanceOrder,
                  { $ifNull: ['$remainingBalance', { $ifNull: ['$remainingCodAmount', 0] }] },
                  0
                ]
              }
            },
            todayRevenue: {
              $sum: {
                $cond: [
                  { $and: [validRevenueOrder, createdToday] },
                  { $ifNull: ['$totalAmount', 0] },
                  0
                ]
              }
            }
          }
        }
      ]),
      User.countDocuments({ role: 'customer' }),
      Order.find({ orderStatus: { $ne: 'PENDING_PAYMENT' } })
        .select('orderNumber orderId user items.productSnapshot.name pricing.totalAmount pricing.amountPaid pricing.remainingBalance totalAmount amountPaid advancePaid remainingBalance remainingCodAmount paymentInfo.method orderStatus createdAt deliveryAddressSnapshot.fullName')
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email phone')
        .lean(),
      FailedPayment.find({ status: 'UNRESOLVED' })
        .select('paymentOrderId userSnapshot.name userSnapshot.email pricing.amountPaid pricing.advanceAmount pricing.totalAmount createdAt')
        .sort({ createdAt: -1 })
        .lean()
    ]);

    const {
      totalOrders = 0,
      todayOrders = 0,
      pendingOrders = 0,
      deliveredOrders = 0,
      totalRevenue = 0,
      advanceCollected = 0,
      remainingBalanceCollection = 0,
      todayRevenue = 0
    } = metrics[0] || {};
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    res.json({
      totalRevenue,
      advanceCollected,
      expectedCodCollection: remainingBalanceCollection,
      remainingBalanceCollection,
      todayRevenue,
      totalOrders,
      todayOrders,
      pendingOrders,
      deliveredOrders,
      totalCustomers,
      averageOrderValue,
      recentOrders,
      failedPayments: unresolvedFailedPayments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin Get All Orders with filtering directly from MongoDB (Excludes unsubmitted PENDING_PAYMENT by default)
// @route GET /api/admin/orders
const getAllAdminOrders = async (req, res) => {
  try {
    const { status, search, dateTab } = req.query;
    let filter = {};

    if (status && status !== 'All') {
      const safeStatus = String(status).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.orderStatus = { $regex: new RegExp(`^${safeStatus}$`, 'i') };
    } else {
      filter.orderStatus = { $ne: 'PENDING_PAYMENT' };
    }

    if (search) {
      const safeSearch = String(search).trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { orderNumber: { $regex: safeSearch, $options: 'i' } },
        { orderId: { $regex: safeSearch, $options: 'i' } },
        { 'paymentInfo.cashfreeOrderId': { $regex: safeSearch, $options: 'i' } },
        { 'paymentInfo.paymentOrderId': { $regex: safeSearch, $options: 'i' } },
        { 'paymentInfo.transactionId': { $regex: safeSearch, $options: 'i' } },
        { 'deliveryAddressSnapshot.fullName': { $regex: safeSearch, $options: 'i' } },
        { 'deliveryAddressSnapshot.email': { $regex: safeSearch, $options: 'i' } },
        { 'deliveryAddressSnapshot.mobileNumber': { $regex: safeSearch, $options: 'i' } },
        { 'items.productSnapshot.name': { $regex: safeSearch, $options: 'i' } }
      ];
    }

    if (req.query.page !== undefined) {
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
      const skip = (page - 1) * limit;
      const paginatedFilter = { ...filter };

      if (dateTab === 'TODAY' || dateTab === 'RECENT') {
        const start = new Date();
        if (dateTab === 'TODAY') {
          start.setHours(0, 0, 0, 0);
        } else {
          start.setTime(Date.now() - 24 * 60 * 60 * 1000);
        }
        paginatedFilter.createdAt = { $gte: start };
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const recentStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [orders, total, summaryData] = await Promise.all([
        Order.find(paginatedFilter)
          .select('orderNumber orderId user items.quantity items.productSnapshot.name pricing.totalAmount totalAmount paymentInfo.status orderStatus createdAt deliveryAddressSnapshot.fullName deliveryAddressSnapshot.email')
          .populate('user', 'name email phone')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments(paginatedFilter),
        Order.aggregate([
          { $match: { orderStatus: { $ne: 'PENDING_PAYMENT' } } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              todayOrders: { $sum: { $cond: [{ $gte: ['$createdAt', todayStart] }, 1, 0] } },
              recentOrders: { $sum: { $cond: [{ $gte: ['$createdAt', recentStart] }, 1, 0] } },
              todayRevenue: {
                $sum: {
                  $cond: [
                    { $gte: ['$createdAt', todayStart] },
                    { $ifNull: ['$totalAmount', 0] },
                    0
                  ]
                }
              }
            }
          }
        ])
      ]);
      const summary = summaryData[0] || {
        totalOrders: 0,
        todayOrders: 0,
        recentOrders: 0,
        todayRevenue: 0
      };

      return res.json({
        orders,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        summary
      });
    }

    const orders = await Order.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get Failed Payments for Admin Alert
// @route GET /api/admin/failed-payments
const getFailedPayments = async (req, res) => {
  try {
    const failed = await FailedPayment.find({ status: 'UNRESOLVED' }).sort({ createdAt: -1 });
    res.json(failed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Recover Failed Payment and Create Order
// @route POST /api/admin/recover-payment/:id
const recoverPaymentOrder = async (req, res) => {
  try {
    const failedPayment = await FailedPayment.findById(req.params.id);
    if (!failedPayment) {
      return res.status(404).json({ message: 'Failed payment record not found' });
    }

    if (failedPayment.status === 'RESOLVED') {
      return res.status(400).json({ message: 'Payment record has already been resolved into an order' });
    }

    const orderNumber = await generateOrderId();
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 4);

    const orderItems = (failedPayment.items || []).map((item) => ({
      product: item.product?._id || item.product || null,
      productSnapshot: {
        name: item.productSnapshot?.name || item.name || 'DD Mystery Box',
        image: item.productSnapshot?.image || item.image || '',
        price: item.unitPrice || item.price || 499,
        description: item.productSnapshot?.description || '',
        contents: item.productSnapshot?.contents || []
      },
      customizationSnapshot: item.customizationSnapshot || item.customization || {},
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || item.price || 499
    }));

    const isFull = failedPayment.paymentMethod === 'FULL';
    const amountPaid = failedPayment.pricing?.amountPaid || failedPayment.pricing?.advanceAmount || 0;
    const totalAmount = failedPayment.pricing?.totalAmount || amountPaid;
    const remainingBalance = Math.max(0, totalAmount - amountPaid);

    const order = new Order({
      orderNumber,
      orderId: orderNumber,
      user: failedPayment.user,
      items: orderItems,
      deliveryAddressSnapshot: failedPayment.deliveryAddress,
      pricing: {
        subtotal: failedPayment.pricing?.subtotal || totalAmount,
        deliveryFee: failedPayment.pricing?.deliveryFee || 0,
        couponDiscount: failedPayment.pricing?.couponDiscount || 0,
        totalAmount,
        advanceAmount: amountPaid,
        amountPaid,
        remainingBalance
      },
      subtotal: failedPayment.pricing?.subtotal || totalAmount,
      deliveryFee: failedPayment.pricing?.deliveryFee || 0,
      totalAmount,
      advanceAmount: amountPaid,
      amountPaid,
      advancePaid: amountPaid,
      remainingBalance,
      remainingCodAmount: remainingBalance,
      paymentInfo: {
        method: isFull ? 'FULL' : 'ADVANCE',
        provider: 'CASHFREE',
        status: isFull ? 'PAID' : 'PARTIALLY_PAID',
        paymentOrderId: failedPayment.paymentOrderId,
        paymentSessionId: failedPayment.paymentSessionId || '',
        transactionId: failedPayment.transactionId || ''
      },
      orderStatus: 'CONFIRMED',
      shipment: { status: 'NOT_CREATED', provider: null, shipmentId: null, awb: null, trackingUrl: null },
      trackingHistory: [
        {
          status: 'CONFIRMED',
          comment: `Order created via Admin Recover Payment action. Payment ID: ${failedPayment.paymentOrderId}`
        }
      ],
      expectedDeliveryDate: expectedDelivery
    });

    const createdOrder = await order.save();

    failedPayment.status = 'RESOLVED';
    failedPayment.resolvedOrderId = createdOrder.orderNumber;
    await failedPayment.save();

    sendNotification({
      type: 'ORDER_CONFIRMATION',
      order: createdOrder,
      orderId: createdOrder.orderNumber
    }).catch(err => console.error('[Recover Notification Error]', err.message));

    res.json({ success: true, message: 'Order created successfully from payment record', order: createdOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin Update Order Status and Tracking
// @route PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, comment, codStatus } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      order.trackingHistory.push({
        status: orderStatus,
        comment: comment || `Order status updated to ${orderStatus}`
      });
    }

    if (codStatus) {
      order.paymentInfo.codStatus = codStatus;
      if (codStatus === 'Collected' && order.orderStatus === 'Out for Delivery') {
        order.orderStatus = 'Delivered';
      }
    }

    const updatedOrder = await order.save();

    // Only trigger automatic email for specific statuses: Order Confirmation, Packed, Delivery (Out for Delivery / Delivered), and Cancelled.
    const statusUpper = (orderStatus || '').toUpperCase();
    const shouldSendAutoEmail = 
      statusUpper.includes('PACKED') ||
      statusUpper.includes('DELIVERED') ||
      statusUpper.includes('OUT FOR DELIVERY') ||
      statusUpper.includes('CONFIRMED') ||
      statusUpper.includes('ORDER PLACED') ||
      statusUpper.includes('CANCELLED');

    if (shouldSendAutoEmail) {
      let notifType = 'ORDER_STATUS_UPDATE';
      if (statusUpper.includes('PACKED')) notifType = 'PACKED';
      else if (statusUpper.includes('OUT FOR DELIVERY')) notifType = 'OUT_FOR_DELIVERY';
      else if (statusUpper.includes('DELIVERED')) notifType = 'DELIVERED';
      else if (statusUpper.includes('CANCELLED')) notifType = 'CANCELLED';
      else if (statusUpper.includes('CONFIRMED') || statusUpper.includes('ORDER PLACED')) notifType = 'ORDER_CONFIRMATION';

      sendNotification({
        type: notifType,
        order: updatedOrder,
        orderId: updatedOrder.orderId,
        customMessage: comment
      }).catch(err => console.error('[Admin Update Notification Error]', err.message));
    } else {
      console.log(`[Admin Update Status] Skipping automatic email for status: "${orderStatus}" per notification rules.`);
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Admin Get Customer Directory
// @route GET /api/admin/customers
const getAdminCustomers = async (req, res) => {
  try {
    if (req.query.page !== undefined) {
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
      const filter = { role: 'customer' };

      if (req.query.search) {
        const search = String(req.query.search).trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      if (req.query.method === 'Google') {
        filter.$and = [
          { $or: [{ googleId: { $ne: null } }, { 'authProviders.provider': 'google' }] }
        ];
      } else if (req.query.method === 'Email') {
        filter.$nor = [{ googleId: { $ne: null } }, { 'authProviders.provider': 'google' }];
      }

      const [customers, total] = await Promise.all([
        User.find(filter)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments(filter)
      ]);
      const customerIds = customers.map((customer) => customer._id);
      const stats = customerIds.length
        ? await Order.aggregate([
          {
            $match: {
              user: { $in: customerIds },
              orderStatus: { $nin: ['Cancelled', 'CANCELLED'] }
            }
          },
          {
            $group: {
              _id: '$user',
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: '$totalAmount' }
            }
          }
        ])
        : [];
      const statsMap = new Map(stats.map((stat) => [stat._id.toString(), stat]));
      const results = customers.map((customer) => {
        const customerStats = statsMap.get(customer._id.toString()) || {};
        return {
          ...customer,
          totalOrders: customerStats.totalOrders || 0,
          totalSpent: customerStats.totalSpent || 0
        };
      });

      return res.json({
        customers: results,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      });
    }

    const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 }).lean();

    const stats = await Order.aggregate([
      { $match: { orderStatus: { $nin: ['Cancelled', 'CANCELLED'] } } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      }
    ]);

    const statsMap = {};
    stats.forEach((s) => {
      if (s._id) statsMap[s._id.toString()] = s;
    });

    const customerStats = customers.map((cust) => {
      const custStat = statsMap[cust._id.toString()] || {};
      return {
        ...cust,
        totalOrders: custStat.totalOrders || 0,
        totalSpent: custStat.totalSpent || 0
      };
    });

    res.json(customerStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin Get All Notification Logs
// @route GET /api/admin/notifications/logs
const getNotificationLogs = async (req, res) => {
  try {
    if (req.query.page !== undefined) {
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
      const filter = {};

      if (req.query.channel && req.query.channel !== 'ALL') {
        filter.channel = { $regex: `^${String(req.query.channel).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' };
      }
      if (req.query.search) {
        const search = String(req.query.search).trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = [
          { orderId: { $regex: search, $options: 'i' } },
          { recipient: { $regex: search, $options: 'i' } },
          { customerName: { $regex: search, $options: 'i' } }
        ];
      }

      const [logs, total] = await Promise.all([
        NotificationLog.find(filter)
          .select('orderId customerName channel recipient event type provider status providerMessageId sentAt createdAt error')
          .sort({ sentAt: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        NotificationLog.countDocuments(filter)
      ]);

      return res.json({ logs, total, page, limit, pages: Math.ceil(total / limit) });
    }

    const logs = await NotificationLog.find().sort({ sentAt: -1, createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin Manual Send Email
// @route POST /api/admin/notifications/send-email
const sendAdminManualEmail = async (req, res) => {
  try {
    const { orderId, recipientEmail, templateType, subject, message } = req.body;
    let order;
    if (orderId) {
      if (orderId.startsWith('DDMB-')) {
        order = await Order.findOne({ orderId }).populate('user');
      } else {
        order = await Order.findById(orderId).populate('user');
      }
    }

    const targetEmail = recipientEmail || order?.deliveryAddressSnapshot?.email || order?.user?.email;

    if (!targetEmail) {
      return res.status(400).json({ success: false, provider: 'brevo', error: 'Recipient email is required' });
    }

    const result = await sendNotification({
      type: templateType || 'CUSTOM_EMAIL',
      recipientEmail: targetEmail,
      recipientPhone: null,
      orderId: orderId || order?.orderId,
      order,
      subject,
      customMessage: message,
      channel: 'Email'
    });

    if (result.emailResult?.success) {
      res.json({
        success: true,
        provider: 'brevo',
        messageId: result.emailResult.providerMessageId,
        message: `Email dispatched successfully to ${targetEmail}`,
        result
      });
    } else {
      res.status(400).json({
        success: false,
        provider: 'brevo',
        error: result.emailResult?.error || result.error || 'Brevo email dispatch failed',
        result
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, provider: 'brevo', error: error.message });
  }
};

// @desc Admin Manual Send SMS
// @route POST /api/admin/notifications/send-sms
const sendAdminManualSms = async (req, res) => {
  try {
    const { orderId, recipientPhone, templateType, message } = req.body;
    let order;
    if (orderId) {
      if (orderId.startsWith('DDMB-')) {
        order = await Order.findOne({ orderId }).populate('user');
      } else {
        order = await Order.findById(orderId).populate('user');
      }
    }

    const targetPhone = recipientPhone || order?.deliveryAddressSnapshot?.mobileNumber || order?.user?.phone;

    if (!targetPhone) {
      return res.status(400).json({ success: false, provider: process.env.SMS_PROVIDER || 'fast2sms', error: 'Recipient phone is required' });
    }

    const result = await sendNotification({
      type: templateType || 'CUSTOM_SMS',
      recipientEmail: null,
      recipientPhone: targetPhone,
      orderId: orderId || order?.orderId,
      order,
      customMessage: message,
      channel: 'SMS'
    });

    if (result.smsResult?.success) {
      res.json({
        success: true,
        provider: process.env.SMS_PROVIDER || 'fast2sms',
        requestId: result.smsResult.providerMessageId,
        message: `SMS dispatched successfully to ${targetPhone}`,
        result
      });
    } else {
      res.status(400).json({
        success: false,
        provider: process.env.SMS_PROVIDER || 'fast2sms',
        error: result.smsResult?.error || result.error || 'SMS dispatch failed',
        result
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, provider: process.env.SMS_PROVIDER || 'fast2sms', error: error.message });
  }
};

// @desc Admin Test Brevo Direct Delivery Endpoint
// @route POST /api/admin/test-email
const testAdminEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, provider: 'brevo', error: 'Valid recipient email is required' });
    }

    const brevoEmailService = require('../services/brevoEmailService');
    const result = await brevoEmailService.sendBrevoEmail({
      recipientEmail: email,
      recipientName: 'Test Customer',
      subject: 'DD Mystery Box — Email Test',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0c0a17; color: #ffffff; border-radius: 12px; border: 1px solid #3b0764;">
          <h2 style="color: #f472b6; margin: 0 0 10px 0;">🎁 DD MYSTERY BOX</h2>
          <p style="margin: 0 0 10px 0;">This is a test email from DD Mystery Box.</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `
    });

    if (result.success) {
      return res.json({
        success: true,
        provider: 'brevo',
        messageId: result.providerMessageId
      });
    } else {
      return res.status(400).json({
        success: false,
        provider: 'brevo',
        error: result.error || 'Brevo email delivery rejected'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, provider: 'brevo', error: error.message });
  }
};

// @desc Verify Brevo account access and sender configuration without sending mail
// @route GET /api/admin/email/configuration
const verifyBrevoEmailConfiguration = async (req, res) => {
  try {
    const { verifyBrevoConfiguration } = require('../services/brevoEmailService');
    const result = await verifyBrevoConfiguration();

    if (!result.success) {
      return res.status(400).json({ success: false, provider: 'brevo', error: result.error });
    }

    return res.json({
      success: true,
      provider: 'brevo',
      sender: result.sender,
      accountEmail: result.accountEmail,
      message: 'Brevo API key and sender are configured. Mail is accepted first; delivery is reported later by Brevo.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, provider: 'brevo', error: error.message });
  }
};

// @desc Admin Test SMS Direct Delivery Endpoint
// @route POST /api/admin/test-sms
const testAdminSms = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, provider: process.env.SMS_PROVIDER || 'fast2sms', error: 'Recipient phone number is required' });
    }

    const { sendSmsMessage } = require('../services/smsService');
    const result = await sendSmsMessage({
      recipientPhone: phone,
      message: 'DD Mystery Box SMS test. Your SMS notification system is working.',
      type: 'TEST_SMS'
    });

    if (result.success) {
      return res.json({
        success: true,
        provider: process.env.SMS_PROVIDER || 'fast2sms',
        requestId: result.providerMessageId
      });
    } else {
      return res.status(400).json({
        success: false,
        provider: process.env.SMS_PROVIDER || 'fast2sms',
        error: result.error || 'SMS provider delivery rejected'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, provider: process.env.SMS_PROVIDER || 'fast2sms', error: error.message });
  }
};

// @desc Delete / Purge All Orders, Payments, Screenshots, Notifications, and Customer Data from Store
// @route DELETE /api/admin/clear-all-data
const clearAllData = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Admin password is required to confirm data purge.' });
    }

    // Verify Admin Password
    const adminUser = await User.findById(req.user._id);
    let isPasswordValid = false;

    if (adminUser) {
      isPasswordValid = await adminUser.matchPassword(password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect admin password. Data purge cancelled.' });
    }

    const Payment = require('../models/Payment');
    const Cart = require('../models/Cart');
    const Address = require('../models/Address');
    const Review = require('../models/Review');
    const Wishlist = require('../models/Wishlist');
    const UserNotification = require('../models/UserNotification');

    // 1. Delete all order, payment, and tracking records
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await NotificationLog.deleteMany({});
    await FailedPayment.deleteMany({});

    // 2. Delete customer shopping data
    await Cart.deleteMany({});
    await Address.deleteMany({});
    await Review.deleteMany({});
    await Wishlist.deleteMany({});
    await UserNotification.deleteMany({});

    // 3. Delete customer users (retain admin user)
    await User.deleteMany({ role: { $ne: 'admin' } });

    res.json({
      success: true,
      message: '🚨 All store test orders, payments, notifications, customer data, and histories have been completely deleted successfully!'
    });
  } catch (error) {
    console.error('[Clear All Data Error]', error);
    res.status(500).json({ message: error.message || 'Failed to clear store data' });
  }
};

// @desc Delete Single Order and associated Payment & Notification records
// @route DELETE /api/admin/orders/:id
const deleteSingleOrder = async (req, res) => {
  try {
    const { id } = req.params;
    let targetOrder = await Order.findById(id);

    if (!targetOrder) {
      targetOrder = await Order.findOne({
        $or: [{ orderNumber: id }, { orderId: id }]
      });
    }

    if (!targetOrder) {
      const paymentItem = await Payment.findById(id);
      if (paymentItem) {
        if (paymentItem.orderId) {
          targetOrder = await Order.findById(paymentItem.orderId);
        }
        await Payment.findByIdAndDelete(id);
      }
    }

    if (targetOrder) {
      const orderDbId = targetOrder._id;
      await Order.findByIdAndDelete(orderDbId);
      await Payment.deleteMany({ $or: [{ orderId: orderDbId }, { orderId: targetOrder.orderNumber }, { orderId: targetOrder.orderId }] });
      await NotificationLog.deleteMany({ orderId: orderDbId });
      return res.json({
        success: true,
        message: `Order #${targetOrder.orderNumber || targetOrder.orderId} deleted successfully`
      });
    }

    res.json({ success: true, message: 'Order item removed' });
  } catch (error) {
    console.error('[Delete Single Order Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete order' });
  }
};

module.exports = {
  getDashboardStats,
  getAllAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  getNotificationLogs,
  sendAdminManualEmail,
  sendAdminManualSms,
  testAdminEmail,
  verifyBrevoEmailConfiguration,
  testAdminSms,
  getFailedPayments,
  recoverPaymentOrder,
  clearAllData,
  deleteSingleOrder
};
