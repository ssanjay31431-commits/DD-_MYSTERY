const Order = require('../models/Order');
const Payment = require('../models/Payment');

const generateOrderId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const orderCount = await Order.countDocuments();
  const paymentCount = await Payment.countDocuments();
  let count = Math.max(orderCount, paymentCount);
  let orderNumber;
  let exists = true;

  while (exists) {
    count++;
    const sequence = String(count).padStart(4, '0');
    orderNumber = `DDMB-${dateStr}-${sequence}`;
    const foundOrder = await Order.findOne({ $or: [{ orderNumber }, { orderId: orderNumber }] });
    const foundPayment = await Payment.findOne({ orderId: orderNumber });
    if (!foundOrder && !foundPayment) {
      exists = false;
    }
  }
  return orderNumber;
};

module.exports = { generateOrderId };
