const axios = require('axios');
const crypto = require('crypto');

const getCashfreeCredentials = () => {
  const appId = (process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || '').trim();
  const secretKey = (process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || '').trim();
  const env = (process.env.CASHFREE_ENV || 'PRODUCTION').toUpperCase().trim();
  const isProd = env === 'PRODUCTION' || env === 'PROD';
  const baseUrl = isProd ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
  const apiVersion = (process.env.CASHFREE_API_VERSION || '2023-08-01').trim();

  return {
    appId,
    secretKey,
    env,
    isProd,
    baseUrl,
    apiVersion
  };
};

const getHeaders = () => {
  const { appId, secretKey, apiVersion } = getCashfreeCredentials();
  return {
    'x-api-version': apiVersion,
    'x-client-id': appId,
    'x-client-secret': secretKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

const isConfigured = () => {
  const { appId, secretKey } = getCashfreeCredentials();
  return Boolean(appId && secretKey && !appId.includes('your_') && !secretKey.includes('your_'));
};

/**
 * Create Official Cashfree PG Order Session
 */
const createOrderSession = async ({ orderId, amount, currency = 'INR', customer = {}, returnUrl }) => {
  const { baseUrl, appId, secretKey, env, isProd } = getCashfreeCredentials();

  if (!appId || !secretKey || appId.includes('your_') || secretKey.includes('your_')) {
    console.error('[Cashfree Error] CASHFREE_CLIENT_ID or CASHFREE_CLIENT_SECRET credentials are missing or unconfigured.');
    throw new Error('Cashfree API credentials (CASHFREE_CLIENT_ID / CASHFREE_CLIENT_SECRET) are missing or invalid in server environment.');
  }

  const rawPhone = String(customer.phone || customer.mobileNumber || '9999999999').replace(/[^\d]/g, '');
  const validPhone = /^\d{10}$/.test(rawPhone) ? rawPhone : '9999999999';

  const payload = {
    order_id: String(orderId),
    order_amount: Number(amount),
    order_currency: String(currency).toUpperCase(),
    customer_details: {
      customer_id: String(customer.id || customer._id || `cust_${Date.now()}`),
      customer_name: String(customer.name || 'Customer').trim(),
      customer_email: String(customer.email || 'customer@example.com').trim(),
      customer_phone: validPhone
    },
    order_meta: {
      return_url: returnUrl || `${process.env.CLIENT_URL || 'https://dd-mystery.vercel.app'}/payment?order_id={order_id}`
    }
  };

  let currentOrderId = String(orderId);
  let responseData = null;
  let attempts = 0;

  while (attempts < 3) {
    attempts++;
    payload.order_id = currentOrderId;

    try {
      const response = await axios.post(`${baseUrl}/orders`, payload, { headers: getHeaders() });
      responseData = response.data || {};
      break;
    } catch (error) {
      const errorData = error.response?.data || {};
      const errorMsg = (errorData.message || error.message || '').toLowerCase();
      
      if (
        (errorMsg.includes('already present') || errorMsg.includes('already exists') || errorData.code === 'order_already_exists') &&
        attempts < 3
      ) {
        const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
        console.warn(`[Cashfree Collision Warning] Order ID ${currentOrderId} already exists on Cashfree. Retrying with suffix ${uniqueSuffix}...`);
        currentOrderId = `${orderId}-${uniqueSuffix}`;
      } else {
        const finalMsg = errorData.message || errorData.details || error.message || 'Failed to create Cashfree order session';
        console.error('[CASHFREE CREATE ORDER ERROR]:', errorData);
        throw new Error(finalMsg);
      }
    }
  }

  const paymentSessionId = responseData?.payment_session_id || responseData?.paymentSessionId;

  if (!paymentSessionId || typeof paymentSessionId !== 'string' || !paymentSessionId.trim()) {
    console.error('[Cashfree Invalid Session Response]:', responseData);
    throw new Error('Cashfree API response did not contain a valid payment_session_id.');
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Cashfree] Payment session received:', true);
  }

  return {
    success: true,
    paymentSessionId: paymentSessionId.trim(),
    payment_session_id: paymentSessionId.trim(),
    paymentOrderId: responseData.order_id || currentOrderId,
    orderAmount: responseData.order_amount || amount,
    orderCurrency: responseData.order_currency || currency,
    environment: env,
    mode: isProd ? 'production' : 'sandbox'
  };
};

const verifyWebhookSignature = (signature, rawPayload, timestamp) => {
  const { secretKey } = getCashfreeCredentials();
  if (!signature || !timestamp || !secretKey) return false;
  try {
    const data = timestamp + (typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload));
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(data)
      .digest('base64');
    return signature === expectedSignature;
  } catch (err) {
    console.error('[Cashfree Webhook Signature Error]:', err.message);
    return false;
  }
};

/**
 * Verify Cashfree Order Payment Status Server-Side
 */
const verifyOrderPayment = async (paymentOrderId) => {
  const { baseUrl, appId, secretKey } = getCashfreeCredentials();

  if (!appId || !secretKey || appId.includes('your_')) {
    throw new Error('Cashfree credentials are not configured in environment variables');
  }

  try {
    const response = await axios.get(`${baseUrl}/orders/${paymentOrderId}`, { headers: getHeaders() });
    const data = response.data || {};
    const isPaid = data.order_status === 'PAID';

    return {
      isPaid,
      status: data.order_status || 'UNKNOWN',
      paymentOrderId: data.order_id,
      transactionId: data.cf_order_id || `cf_tx_${Date.now()}`,
      orderAmount: data.order_amount
    };
  } catch (error) {
    const errorData = error.response?.data || {};
    const errorMsg = errorData.message || errorData.details || error.message || 'Failed to verify Cashfree order payment';
    console.error('[CASHFREE VERIFY ERROR]:', errorData);
    throw new Error(errorMsg);
  }
};

module.exports = {
  createOrderSession,
  verifyOrderPayment,
  verifyWebhookSignature,
  isConfigured
};
