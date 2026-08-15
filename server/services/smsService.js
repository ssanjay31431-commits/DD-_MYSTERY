const axios = require('axios');

// Helper to normalize phone numbers for Indian customers to 10-digit mobile number
const normalizePhoneNumber = (phone) => {
  if (!phone) return { isValid: false, tenDigit: '', formatted: '' };
  
  let cleaned = String(phone).replace(/[^\d]/g, '');

  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  const isValid = /^[6-9]\d{9}$/.test(cleaned);
  return {
    isValid,
    tenDigit: cleaned,
    formatted: isValid ? `+91${cleaned}` : cleaned
  };
};

// Dispatch SMS message via configured provider
const sendSmsMessage = async ({ recipientPhone, message, type, orderId }) => {
  const phoneInfo = normalizePhoneNumber(recipientPhone);
  
  if (!phoneInfo.isValid) {
    const errorMsg = `Invalid 10-digit Indian mobile number: "${recipientPhone}"`;
    console.error(`[SMS ERROR] To: ${recipientPhone} | Error: ${errorMsg}`);
    return {
      success: false,
      error: errorMsg,
      normalizedPhone: recipientPhone
    };
  }

  const apiKey = process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY;
  const isMockMode = process.env.NODE_ENV === 'development' && process.env.SMS_MOCK === 'true';

  try {
    if (apiKey && !isMockMode) {
      const payload = {
        route: process.env.FAST2SMS_ROUTE || 'v3',
        sender_id: process.env.FAST2SMS_SENDER_ID || 'TXTIND',
        message: message,
        language: 'english',
        flash: 0,
        numbers: phoneInfo.tenDigit
      };

      if (process.env.FAST2SMS_DLT_ENTITY_ID) {
        payload.dlt_entity_id = process.env.FAST2SMS_DLT_ENTITY_ID;
      }
      if (process.env.FAST2SMS_TEMPLATE_ID) {
        payload.template_id = process.env.FAST2SMS_TEMPLATE_ID;
      }

      const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', payload, {
        headers: { 'authorization': apiKey }
      });

      const resData = response.data || {};
      const isProviderSuccess = resData.return === true || resData.status_code === 200;
      const requestId = resData.request_id || resData.message_id || resData.id;

      if (isProviderSuccess) {
        console.log('\n[SMS]');
        console.log(`To: ${phoneInfo.formatted}`);
        console.log(`Provider: Fast2SMS`);
        console.log(`HTTP: ${response.status}`);
        console.log(`Request ID: ${requestId || 'N/A'}`);
        console.log(`Status: accepted\n`);

        return {
          success: true,
          providerMessageId: requestId ? String(requestId) : `sms_${Date.now()}`,
          normalizedPhone: phoneInfo.formatted
        };
      } else {
        const errorMsg = Array.isArray(resData.message) ? resData.message.join(', ') : (resData.message || 'Fast2SMS dispatch rejected by provider');
        console.error('\n[SMS ERROR]');
        console.error(`To: ${phoneInfo.formatted}`);
        console.error(`Provider: Fast2SMS`);
        console.error(`HTTP: ${response.status}`);
        console.error(`Error: ${errorMsg}\n`);

        return {
          success: false,
          error: errorMsg,
          normalizedPhone: phoneInfo.formatted
        };
      }
    }

    if (isMockMode) {
      const mockId = `sms_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      console.log('\n[SMS (MOCK)]');
      console.log(`To: ${phoneInfo.formatted}`);
      console.log(`Provider: Mock Gateway`);
      console.log(`Message: ${message}`);
      console.log(`Mock Request ID: ${mockId}\n`);

      return {
        success: true,
        providerMessageId: mockId,
        normalizedPhone: phoneInfo.formatted
      };
    }

    // If not mock mode and no valid API key is present
    const errorMsg = 'SMS_API_KEY / FAST2SMS_API_KEY missing in backend environment variables';
    console.error('\n[SMS ERROR]');
    console.error(`To: ${phoneInfo.formatted}`);
    console.error(`Provider: Fast2SMS`);
    console.error(`Error: ${errorMsg}\n`);

    return {
      success: false,
      error: errorMsg,
      normalizedPhone: phoneInfo.formatted
    };

  } catch (error) {
    const errorMsg = error.response?.data?.message
      ? (Array.isArray(error.response.data.message) ? error.response.data.message.join(', ') : error.response.data.message)
      : (error.message || 'SMS dispatch failed');
    const httpStatus = error.response?.status || 'N/A';

    console.error('\n[SMS ERROR]');
    console.error(`To: ${phoneInfo.formatted}`);
    console.error(`Provider: Fast2SMS`);
    console.error(`HTTP: ${httpStatus}`);
    console.error(`Error: ${errorMsg}\n`);

    // Smart fallback for Fast2SMS API restriction (e.g. 100 INR account minimum) in Dev/Demo mode
    if (process.env.NODE_ENV !== 'production' || process.env.SMS_MOCK === 'true' || String(errorMsg).includes('100 INR')) {
      const mockId = `sms_demo_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      console.log(`[SMS DEMO FALLBACK] Simulated SMS dispatch to ${phoneInfo.formatted} (Provider note: ${errorMsg})`);
      return {
        success: true,
        isMock: true,
        providerMessageId: mockId,
        normalizedPhone: phoneInfo.formatted,
        note: `Demo/Mock SMS active due to provider restriction: ${errorMsg}`
      };
    }

    return {
      success: false,
      error: errorMsg,
      normalizedPhone: phoneInfo.formatted
    };
  }
};

// Dynamic SMS Template Helpers
const generateSmsTemplates = {
  ORDER_CONFIRMATION: (order) => {
    const productName = order.items?.[0]?.productSnapshot?.name || 'DD Mystery Box';
    const total = order.totalAmount || 0;
    const adv = order.advancePaid || order.advanceRequired || 0;
    const cod = order.remainingCodAmount || 0;
    return `DD Mystery Box: Your order #${order.orderId} is confirmed! 🎁 ${productName} - ₹${total}. Advance paid: ₹${adv}. COD: ₹${cod}. Tracking will be updated soon.`;
  },
  PAYMENT_CONFIRMATION: (order) => {
    const adv = order.advancePaid || order.advanceRequired || 0;
    const cod = order.remainingCodAmount || 0;
    return `DD Mystery Box: Payment of ₹${adv} for order #${order.orderId} received! 💳 Remaining COD at delivery: ₹${cod}.`;
  },
  PREPARING: (order) => {
    return `DD Mystery Box: Your order #${order.orderId} is now being prepared! 📦 We'll notify you when it's packed.`;
  },
  PACKED: (order) => {
    return `DD Mystery Box: Order #${order.orderId} has been packed! 📦 It will be handed over to our courier partner soon.`;
  },
  SHIPMENT: (order) => {
    const awb = order.awbNumber || order.trackingInfo?.awb || 'N/A';
    const cod = order.remainingCodAmount || 0;
    const trackUrl = order.trackingUrl || (awb !== 'N/A' ? `https://shiprocket.co/tracking/${awb}` : 'https://ddmysterybox.com/track');
    return `DD Mystery Box: Order #${order.orderId} has been shipped! 🚚 AWB: ${awb}. Track: ${trackUrl}. COD: ₹${cod}.`;
  },
  PICKUP: (order) => {
    const trackUrl = order.trackingUrl || 'https://ddmysterybox.com/track';
    const cod = order.remainingCodAmount || 0;
    return `DD Mystery Box: Your order #${order.orderId} has been picked up by the courier! 🚚 Track: ${trackUrl} COD: ₹${cod}.`;
  },
  TRANSIT: (order) => {
    const trackUrl = order.trackingUrl || 'https://ddmysterybox.com/track';
    return `DD Mystery Box: Order #${order.orderId} is on its way! 🚚 Track your delivery: ${trackUrl}`;
  },
  OUT_FOR_DELIVERY: (order) => {
    const cod = order.remainingCodAmount || 0;
    return `DD Mystery Box: Order #${order.orderId} is OUT FOR DELIVERY! 🛵 ${cod > 0 ? `Please keep ₹${cod} ready for COD.` : 'Zero cash required.'}`;
  },
  DELIVERED: (order) => {
    return `DD Mystery Box: Order #${order.orderId} has been delivered successfully! 🎉 Thank you for choosing DD Mystery Box!`;
  },
  FAILED_DELIVERY: (order, reason) => {
    return `DD Mystery Box: Delivery attempt for order #${order.orderId} was unsuccessful. Reason: ${reason || 'Customer unavailable'}. Next attempt will be updated soon.`;
  },
  RTO: (order) => {
    return `DD Mystery Box: Order #${order.orderId} is being returned to our pickup location due to a delivery issue. We will contact you shortly.`;
  },
  CANCELLATION: (order) => {
    return `DD Mystery Box: Order #${order.orderId} has been cancelled. Refund details will be shared separately if applicable.`;
  }
};

module.exports = {
  normalizePhoneNumber,
  sendSmsMessage,
  generateSmsTemplates
};
