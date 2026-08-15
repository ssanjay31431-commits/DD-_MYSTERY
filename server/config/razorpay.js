const Razorpay = require('razorpay');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (key_id && key_secret && !key_id.includes('rzp_test_ddmysterybox')) {
    try {
      if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
          key_id,
          key_secret
        });
      }
      return razorpayInstance;
    } catch (err) {
      console.warn('[Razorpay] Using Test Mode fallback due to init error:', err.message);
      return null;
    }
  }
  return null;
};

module.exports = { getRazorpayInstance };
