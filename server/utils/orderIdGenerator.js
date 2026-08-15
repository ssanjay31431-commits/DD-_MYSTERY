const Order = require('../models/Order');

const generateOrderId = async () => {
  const year = new Date().getFullYear();
  const count = await Order.countDocuments();
  const sequence = String(count + 1).padStart(5, '0');
  return `DDMB-${year}-${sequence}`;
};

module.exports = { generateOrderId };
