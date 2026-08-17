const NotificationLog = require('../models/NotificationLog');
const UserNotification = require('../models/UserNotification');
const Order = require('../models/Order');

const brevoEmailService = require('../services/brevoEmailService');
const { sendSmsMessage, generateSmsTemplates } = require('../services/smsService');

/**
 * Universal Central Notification Orchestrator
 * Dispatches automatic Brevo Email + SMS + records DB logs + creates customer in-app notifications.
 */
const sendNotification = async ({ type, recipientEmail, recipientPhone, orderId, order, subject, customMessage, reason, channel: requestedChannel }) => {
  let targetOrder = order;

  // Fetch target order if not provided
  if (!targetOrder && orderId) {
    try {
      if (orderId.startsWith('DDMB-')) {
        targetOrder = await Order.findOne({ orderId }).populate('user');
      } else {
        targetOrder = await Order.findById(orderId).populate('user');
      }
    } catch (err) {
      console.error('[Notification Orchestrator Error] Order lookup failed:', err.message);
      return { success: false, error: 'Order not found' };
    }
  }

  // Extract email and phone with proper fallback chain
  const email = recipientEmail || targetOrder?.user?.email || targetOrder?.deliveryAddressSnapshot?.email;
  const phone = recipientPhone || targetOrder?.deliveryAddressSnapshot?.mobileNumber || targetOrder?.user?.phone;
  const customerName = targetOrder?.deliveryAddressSnapshot?.fullName || targetOrder?.user?.name || 'Customer';
  const customOrderId = targetOrder?.orderId || orderId || 'DDMB-ORDER';
  const userId = targetOrder?.user?._id || targetOrder?.user || null;

  let emailResult = { success: false, error: 'Not attempted' };
  let smsResult = { success: false, error: 'Not attempted' };
  let smsText = '';

  // Determine channels to attempt based on parameters or requestedChannel
  const shouldSendEmail = (!requestedChannel || requestedChannel === 'Email' || requestedChannel === 'ALL') && email && email.includes('@');
  const shouldSendSms = (!requestedChannel || requestedChannel === 'SMS' || requestedChannel === 'ALL') && phone;

  // 1. Dispatch Brevo Email with Idempotency Guard
  if (shouldSendEmail) {
    const emailIdempotencyKey = `${customOrderId}_${type}_Email`;

    try {
      // Check for duplicate automatic event notification
      const existingLog = await NotificationLog.findOne({ idempotencyKey: emailIdempotencyKey, status: 'Sent' });
      if (existingLog && !requestedChannel) {
        console.log(`[Idempotency] Email for ${emailIdempotencyKey} already sent. Skipping duplicate dispatch.`);
        emailResult = { success: true, duplicate: true, providerMessageId: existingLog.providerMessageId };
      } else {
        switch (type) {
          case 'ORDER_CONFIRMATION':
          case 'ORDER_PLACED':
          case 'CONFIRMED':
          case 'Order Confirmed':
            emailResult = await brevoEmailService.sendOrderConfirmationEmail({ recipientEmail: email, recipientName: customerName, order: targetOrder });
            break;
          case 'PAYMENT_CONFIRMATION':
            emailResult = await brevoEmailService.sendPaymentConfirmationEmail({ recipientEmail: email, recipientName: customerName, order: targetOrder });
            break;
          case 'PREPARING':
          case 'Preparing':
            emailResult = await brevoEmailService.sendPreparingEmail({ recipientEmail: email, recipientName: customerName, order: targetOrder });
            break;
          case 'PACKED':
          case 'Packed':
            emailResult = await brevoEmailService.sendPackedEmail({ recipientEmail: email, recipientName: customerName, order: targetOrder });
            break;
          case 'SHIPPED':
          case 'SHIPMENT':
          case 'Shipped':
            emailResult = await brevoEmailService.sendShipmentEmail({ recipientEmail: email, recipientName: customerName, order: targetOrder });
            break;
          case 'PICKUP':
            emailResult = await brevoEmailService.sendPickupEmail({ recipientEmail: email, recipientName: customerName, order: targetOrder });
            break;
          case 'TRANSIT':
            emailResult = await brevoEmailService.sendTransitEmail({ recipientEmail: email, recipientName: customerName, order: targetOrder });
            break;
          case 'OUT_FOR_DELIVERY':
          case 'Out for Delivery':
            emailResult = await brevoEmailService.sendOutForDeliveryEmail({ recipientEmail: email, recipientName: customerName, order: targetOrder });
            break;
          case 'DELIVERED':
          case 'Delivered':
            emailResult = await brevoEmailService.sendDeliveredEmail({ recipientEmail: email, recipientName: customerName, order: targetOrder });
            break;
          case 'FAILED_DELIVERY':
            emailResult = await brevoEmailService.sendFailedDeliveryEmail({ recipientEmail: email, recipientName: customerName, order: targetOrder, reason });
            break;
          case 'CANCELLED':
          case 'Cancelled':
            emailResult = await brevoEmailService.sendCancellationEmail({ recipientEmail: email, recipientName: customerName, order: targetOrder, reason });
            break;
          default:
            emailResult = await brevoEmailService.sendCustomEmail({ recipientEmail: email, recipientName: customerName, subject, customMessage, order: targetOrder });
        }

        // Log Email to MongoDB NotificationLog
        await NotificationLog.create({
          orderId: customOrderId,
          userId,
          customerName,
          recipient: email,
          channel: 'Email',
          type: type || 'CUSTOM_EMAIL',
          event: type || 'CUSTOM_EMAIL',
          status: emailResult.success ? 'Sent' : 'Failed',
          provider: 'Brevo',
          providerMessageId: emailResult.providerMessageId || '',
          providerResponse: emailResult.providerResponse || null,
          httpStatus: emailResult.httpStatus || null,
          subject: subject || type,
          content: customMessage || 'HTML Transactional Email Dispatched',
          error: emailResult.error || '',
          idempotencyKey: emailIdempotencyKey
        });
      }
    } catch (err) {
      console.error('[Notification Orchestrator Email Error]', err.message);
      emailResult = { success: false, error: err.message };
    }
  }

  // 2. Dispatch SMS with Idempotency Guard
  if (shouldSendSms) {
    const smsIdempotencyKey = `${customOrderId}_${type}_SMS`;

    try {
      const existingLog = await NotificationLog.findOne({ idempotencyKey: smsIdempotencyKey, status: 'Sent' });
      if (existingLog && !requestedChannel) {
        console.log(`[Idempotency] SMS for ${smsIdempotencyKey} already sent. Skipping duplicate dispatch.`);
        smsResult = { success: true, duplicate: true, providerMessageId: existingLog.providerMessageId };
      } else {
        switch (type) {
          case 'ORDER_CONFIRMATION':
          case 'ORDER_PLACED':
            smsText = generateSmsTemplates.ORDER_CONFIRMATION(targetOrder);
            break;
          case 'PAYMENT_CONFIRMATION':
            smsText = generateSmsTemplates.PAYMENT_CONFIRMATION(targetOrder);
            break;
          case 'PREPARING':
            smsText = generateSmsTemplates.PREPARING(targetOrder);
            break;
          case 'PACKED':
            smsText = generateSmsTemplates.PACKED(targetOrder);
            break;
          case 'SHIPPED':
          case 'SHIPMENT':
            smsText = generateSmsTemplates.SHIPMENT(targetOrder);
            break;
          case 'PICKUP':
            smsText = generateSmsTemplates.PICKUP(targetOrder);
            break;
          case 'TRANSIT':
            smsText = generateSmsTemplates.TRANSIT(targetOrder);
            break;
          case 'OUT_FOR_DELIVERY':
            smsText = generateSmsTemplates.OUT_FOR_DELIVERY(targetOrder);
            break;
          case 'DELIVERED':
            smsText = generateSmsTemplates.DELIVERED(targetOrder);
            break;
          case 'FAILED_DELIVERY':
            smsText = generateSmsTemplates.FAILED_DELIVERY(targetOrder, reason);
            break;
          case 'RTO':
            smsText = generateSmsTemplates.RTO(targetOrder);
            break;
          case 'CANCELLED':
            smsText = generateSmsTemplates.CANCELLATION(targetOrder);
            break;
          default:
            smsText = customMessage || `DD Mystery Box: Update for order #${customOrderId}`;
        }

        smsResult = await sendSmsMessage({
          recipientPhone: phone,
          message: smsText,
          type: type || 'CUSTOM_SMS',
          orderId: customOrderId
        });

        // Log SMS to MongoDB NotificationLog
        await NotificationLog.create({
          orderId: customOrderId,
          userId,
          customerName,
          recipient: smsResult.normalizedPhone || phone,
          channel: 'SMS',
          type: type || 'CUSTOM_SMS',
          event: type || 'CUSTOM_SMS',
          status: smsResult.success ? 'Sent' : 'Failed',
          provider: process.env.SMS_PROVIDER || 'Fast2SMS',
          providerMessageId: smsResult.providerMessageId || '',
          providerResponse: smsResult.providerResponse || null,
          httpStatus: smsResult.httpStatus || null,
          subject: `SMS: ${type}`,
          content: smsText,
          error: smsResult.error || '',
          idempotencyKey: smsIdempotencyKey
        });
      }
    } catch (err) {
      console.error('[Notification Orchestrator SMS Error]', err.message);
      smsResult = { success: false, error: err.message };
    }
  }

  // 3. Create In-App User Notification in MongoDB if user is attached
  if (userId && (emailResult.success || smsResult.success)) {
    try {
      await UserNotification.create({
        user: userId,
        orderId: customOrderId,
        title: `Order Update #${customOrderId}`,
        message: smsText || customMessage || `Order status updated to ${targetOrder?.orderStatus || type}`,
        type: type || 'ORDER_UPDATE'
      });
    } catch (err) {
      console.error('[Notification Orchestrator In-App Error]', err.message);
    }
  }

  const overallSuccess = (shouldSendEmail ? emailResult.success : true) && (shouldSendSms ? smsResult.success : true);

  return {
    success: (shouldSendEmail ? emailResult.success : true) || (shouldSendSms ? smsResult.success : true),
    overallSuccess,
    emailResult,
    smsResult,
    error: emailResult.error !== 'Not attempted' && !emailResult.success ? emailResult.error : (smsResult.error !== 'Not attempted' && !smsResult.success ? smsResult.error : null)
  };
};

module.exports = { sendNotification };
