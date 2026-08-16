const Order = require('../models/Order');

const generateOrderId = async () => {
  const year = new Date().getFullYear();
  let count = await Order.countDocuments();
  let orderNumber;
  let exists = true;
  
  while (exists) {
    count++;
    const sequence = String(count).padStart(5, '0');
    orderNumber = `DDMB-${year}-${sequence}`;
    const found = await Order.findOne({ $or: [{ orderNumber }, { orderId: orderNumber }] });
    if (!found) {
      exists = false;
    }
  }
  return orderNumber;
};

module.exports = { generateOrderId };
