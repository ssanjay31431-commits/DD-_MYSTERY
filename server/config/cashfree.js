const axios = require('axios');

const getCashfreeConfig = () => {
  const env = (process.env.CASHFREE_ENV || 'TEST').toUpperCase();
  const clientId = process.env.CASHFREE_CLIENT_ID || '';
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET || '';
  const apiVersion = process.env.CASHFREE_API_VERSION || '2023-08-01';

  const baseUrl = (env === 'PRODUCTION' || env === 'PROD')
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

  return {
    baseUrl,
    clientId,
    clientSecret,
    env,
    apiVersion
  };
};

const getCashfreeHeaders = () => {
  const { clientId, clientSecret, apiVersion } = getCashfreeConfig();
  return {
    'x-client-id': clientId.trim(),
    'x-client-secret': clientSecret.trim(),
    'x-api-version': apiVersion.trim(),
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  };
};

// Helper for making requests to Cashfree REST API
const cashfreeRequest = async (method, endpoint, data = null) => {
  const { baseUrl } = getCashfreeConfig();
  const headers = getCashfreeHeaders();

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  try {
    const response = await axios({
      method,
      url,
      headers,
      data
    });
    return response.data;
  } catch (error) {
    const errorData = error.response?.data || {};
    console.error(`[Cashfree API Error ${method} ${endpoint}]:`, errorData.message || error.message || errorData);
    const customErr = new Error(errorData.message || errorData.details || error.message || 'Cashfree API Request Failed');
    customErr.status = error.response?.status || 500;
    customErr.data = errorData;
    throw customErr;
  }
};

module.exports = {
  getCashfreeConfig,
  getCashfreeHeaders,
  cashfreeRequest
};
