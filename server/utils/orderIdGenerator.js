const Order = require('../models/Order');
const Payment = require('../models/Payment');

const generateOrderId = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const timeStr = `${hours}${mins}${secs}`;

  let orderNumber;
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 50) {
    attempts++;
    const randomEntropy = Math.floor(10 + Math.random() * 90);
    orderNumber = `DDMB-${dateStr}-${timeStr}${randomEntropy}`;
    const foundOrder = await Order.findOne({ $or: [{ orderNumber }, { orderId: orderNumber }] });
    const foundPayment = await Payment.findOne({ orderId: orderNumber });
    if (!foundOrder && !foundPayment) {
      exists = false;
    }
  }
  return orderNumber;
};

module.exports = { generateOrderId };
