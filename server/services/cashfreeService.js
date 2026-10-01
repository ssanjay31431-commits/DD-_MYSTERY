const axios = require('axios');

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET;
const CASHFREE_ENV = (process.env.CASHFREE_ENV || 'TEST').toUpperCase();

const BASE_URL = (CASHFREE_ENV === 'PRODUCTION' || CASHFREE_ENV === 'PROD')
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

const getHeaders = () => ({
  'x-api-version': '2023-08-01',
  'x-client-id': CASHFREE_APP_ID,
  'x-client-secret': CASHFREE_SECRET_KEY,
  'Content-Type': 'application/json'
});

const isConfigured = () => {
  return Boolean(CASHFREE_APP_ID && CASHFREE_SECRET_KEY && !CASHFREE_APP_ID.includes('your_'));
};

/**
 * Create Cashfree PG Order Session
 */
const createOrderSession = async ({ orderId, amount, currency = 'INR', customer, returnUrl }) => {
  if (!isConfigured()) {
    console.log(`[CASHFREE (MOCK MODE)] Creating payment order ${orderId} for ₹${amount}`);
    const mockSessionId = `session_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    return {
      success: true,
      isMockMode: true,
      paymentSessionId: mockSessionId,
      paymentOrderId: orderId,
      orderAmount: amount,
      orderCurrency: currency
    };
  }

  try {
    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency,
      customer_details: {
        customer_id: customer.id || `cust_${Date.now()}`,
        customer_name: customer.name || 'Customer',
        customer_email: customer.email || 'customer@example.com',
        customer_phone: customer.phone || '9999999999'
      },
      order_meta: {
        return_url: returnUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/cashfree-return?order_id={order_id}`
      }
    };

    const response = await axios.post(`${BASE_URL}/orders`, payload, { headers: getHeaders() });
    
    return {
      success: true,
      isMockMode: false,
      paymentSessionId: response.data.payment_session_id,
      paymentOrderId: response.data.order_id,
      orderAmount: response.data.order_amount,
      orderCurrency: response.data.order_currency
    };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to create Cashfree order session';
    console.error('[CASHFREE CREATE ERROR]', errorMsg);
    throw new Error(errorMsg);
  }
};

const crypto = require('crypto');

const verifyWebhookSignature = (signature, rawPayload, timestamp) => {
  if (!signature || !timestamp || !CASHFREE_SECRET_KEY) return false;
  try {
    const data = timestamp + (typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload));
    const expectedSignature = crypto
      .createHmac('sha256', CASHFREE_SECRET_KEY)
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
  if (!isConfigured()) {
    throw new Error('Cashfree credentials are not configured in environment variables');
  }

  try {
    const response = await axios.get(`${BASE_URL}/orders/${paymentOrderId}`, { headers: getHeaders() });
    const data = response.data || {};
    const isPaid = data.order_status === 'PAID';

    return {
      isPaid,
      status: data.order_status || 'UNKNOWN',
      paymentOrderId: data.order_id,
      transactionId: data.cf_order_id || `cf_tx_${Date.now()}`,
      orderAmount: data.order_amount,
      isMockMode: false
    };
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to verify Cashfree order payment';
    console.error('[CASHFREE VERIFY ERROR]', errorMsg);
    throw new Error(errorMsg);
  }
};

module.exports = {
  createOrderSession,
  verifyOrderPayment,
  verifyWebhookSignature,
  isConfigured
};
