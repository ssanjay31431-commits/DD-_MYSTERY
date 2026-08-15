const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Theme = require('../models/Theme');
const Inventory = require('../models/Inventory');
const NotificationLog = require('../models/NotificationLog');
const { sendNotification } = require('../utils/emailService');

// @desc Get Admin Dashboard Analytics Summary
// @route GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const totalOrders = await Order.countDocuments();
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: todayStart } });
    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['Order Placed', 'Advance Payment Confirmed', 'Order Confirmed', 'Preparing', 'Packed', 'Shipped', 'Out for Delivery'] } });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Revenue Aggregations
    const totalRevenueData = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = totalRevenueData[0]?.total || 0;

    const advanceCollectedData = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$advancePaid' } } }
    ]);
    const advanceCollected = advanceCollectedData[0]?.total || 0;

    const expectedCodData = await Order.aggregate([
      { $match: { orderStatus: { $nin: ['Cancelled', 'Delivered'] } } },
      { $group: { _id: null, total: { $sum: '$remainingCodAmount' } } }
    ]);
    const expectedCodCollection = expectedCodData[0]?.total || 0;

    const todayRevenueData = await Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const todayRevenue = todayRevenueData[0]?.total || 0;

    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name email');

    res.json({
      totalRevenue,
      advanceCollected,
      expectedCodCollection,
      todayRevenue,
      totalOrders,
      todayOrders,
      pendingOrders,
      deliveredOrders,
      totalCustomers,
      averageOrderValue,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin Get All Orders with filtering
// @route GET /api/admin/orders
const getAllAdminOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};

    if (status && status !== 'All') {
      filter.orderStatus = status;
    }

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'deliveryAddressSnapshot.fullName': { $regex: search, $options: 'i' } },
        { 'deliveryAddressSnapshot.mobileNumber': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(orders);
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

    // Map orderStatus to Notification Type
    let notifType = 'ORDER_STATUS_UPDATE';
    const statusUpper = (orderStatus || '').toUpperCase();
    if (statusUpper.includes('PREPARING')) notifType = 'PREPARING';
    else if (statusUpper.includes('PACKED')) notifType = 'PACKED';
    else if (statusUpper.includes('SHIPPED')) notifType = 'SHIPPED';
    else if (statusUpper.includes('OUT FOR DELIVERY')) notifType = 'OUT_FOR_DELIVERY';
    else if (statusUpper.includes('DELIVERED')) notifType = 'DELIVERED';
    else if (statusUpper.includes('CANCELLED')) notifType = 'CANCELLED';

    sendNotification({
      type: notifType,
      order: updatedOrder,
      orderId: updatedOrder.orderId,
      customMessage: comment
    }).catch(err => console.error('[Admin Update Notification Error]', err.message));

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Admin Get Customer Directory
// @route GET /api/admin/customers
const getAdminCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });

    const customerStats = await Promise.all(
      customers.map(async (cust) => {
        const orderCount = await Order.countDocuments({ user: cust._id });
        const totalSpentData = await Order.aggregate([
          { $match: { user: cust._id, orderStatus: { $ne: 'Cancelled' } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        return {
          ...cust.toObject(),
          totalOrders: orderCount,
          totalSpent: totalSpentData[0]?.total || 0
        };
      })
    );

    res.json(customerStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin Get All Notification Logs
// @route GET /api/admin/notifications/logs
const getNotificationLogs = async (req, res) => {
  try {
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

module.exports = {
  getDashboardStats,
  getAllAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  getNotificationLogs,
  sendAdminManualEmail,
  sendAdminManualSms,
  testAdminEmail,
  testAdminSms
};

