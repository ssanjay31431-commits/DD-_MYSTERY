const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AdminSettings = require('../models/AdminSettings');
const { generateOrderId } = require('../utils/orderIdGenerator');
const { sendNotification } = require('../utils/emailService');

// @desc Create new order from cart / direct item with Advance + COD calculation
// @route POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, subtotal, deliveryFee = 0, couponDiscount = 0, couponCode = '', paymentMethod = 'cod_advance' } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    // 1. Calculate Order Total on Backend
    const calculatedSubtotal = items.reduce((acc, item) => {
      const price = item.unitPrice || item.product?.price || 0;
      return acc + price * (item.quantity || 1);
    }, 0);

    const totalAmount = Math.max(0, calculatedSubtotal + deliveryFee - couponDiscount);

    // 2. Compute Advance Required & Remaining COD based on Payment Method selected
    let advanceRequired = 0;
    let remainingCodAmount = 0;
    let methodTitle = '';
    let initialOrderStatus = 'Order Placed';

    if (paymentMethod === 'full_online') {
      advanceRequired = totalAmount;
      remainingCodAmount = 0;
      methodTitle = 'Full Online Payment';
    } else if (paymentMethod === 'full_cod') {
      advanceRequired = 0;
      remainingCodAmount = totalAmount;
      methodTitle = 'Cash on Delivery';
      initialOrderStatus = 'Order Confirmed';
    } else {
      // Advance Payment 100RS + Cash on Delivery
      advanceRequired = Math.min(totalAmount, 100);
      remainingCodAmount = Math.max(0, Math.round((totalAmount - advanceRequired) * 100) / 100);
      methodTitle = 'Advance (₹100) + Cash on Delivery';
    }

    const customOrderId = await generateOrderId();

    // Calculate expected delivery date (4 days from now)
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 4);

    const orderItems = items.map((item) => ({
      product: item.product?._id || item.product,
      productSnapshot: {
        name: item.product?.name || item.name || 'DD Mystery Box',
        image: item.product?.image || item.image || '',
        price: item.unitPrice || item.price || 0,
        description: item.product?.description || '',
        contents: item.product?.contents || []
      },
      customizationSnapshot: item.customization || {},
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || item.price || 0
    }));

    const order = new Order({
      orderId: customOrderId,
      user: req.user._id,
      items: orderItems,
      deliveryAddressSnapshot: deliveryAddress,
      subtotal: calculatedSubtotal,
      deliveryFee,
      couponDiscount,
      couponCode,
      totalAmount,
      advanceRequired,
      advancePaid: 0,
      remainingCodAmount,
      paymentInfo: {
        method: methodTitle,
        advanceStatus: paymentMethod === 'full_cod' ? 'Paid' : 'Pending',
        codStatus: 'Pending'
      },
      orderStatus: initialOrderStatus,
      trackingHistory: [
        {
          status: initialOrderStatus,
          comment: paymentMethod === 'full_cod'
            ? 'Your order has been registered via Cash on Delivery!'
            : `Your order has been registered! Please complete the ${methodTitle} to confirm.`
        }
      ],
      expectedDeliveryDate: expectedDelivery,
      luckyRewardUnlocked: totalAmount >= 199
    });

    const createdOrder = await order.save();

    // Clear cart after placing order
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], couponApplied: { code: '', discountAmount: 0 } });

    // Send notification trigger with proper await and error handling
    try {
      console.log(`[Order ${createdOrder.orderId}] Sending notifications...`);
      await sendNotification({
        type: 'ORDER_PLACED',
        order: createdOrder,
        orderId: createdOrder.orderId
      });
      console.log(`[Order ${createdOrder.orderId}] Notifications sent successfully`);
    } catch (notificationError) {
      console.error(`[Order ${createdOrder.orderId}] Notification error (non-blocking):`, notificationError.message);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Get user's orders
// @route GET /api/orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin Get All Orders
// @route GET /api/orders/admin/all
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Admin Update Order Status
// @route PUT /api/orders/admin/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, codStatus } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      order.trackingHistory.push({
        status: orderStatus,
        comment: `Order status updated to ${orderStatus} by DD Mystery Box Admin.`,
        timestamp: new Date()
      });
    }

    if (codStatus) {
      order.paymentInfo.codStatus = codStatus;
      if (codStatus === 'Collected') {
        order.paymentInfo.paymentStatus = 'Completed';
      }
    }

    const updatedOrder = await order.save();

    // Trigger status update email automatically
    try {
      console.log(`[Order ${order.orderId}] Sending status update notification...`);
      await sendNotification({
        type: orderStatus || 'STATUS_UPDATE',
        order: updatedOrder,
        orderId: order.orderId
      });
      console.log(`[Order ${order.orderId}] Status notification sent successfully`);
    } catch (notificationError) {
      console.error(`[Order ${order.orderId}] Status notification error:`, notificationError.message);
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Get order details by mongo ID or custom orderId
// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const param = req.params.id;
    let order;

    if (param.startsWith('DDMB-')) {
      order = await Order.findOne({ orderId: param }).populate('user', 'name email phone');
    } else {
      order = await Order.findById(param).populate('user', 'name email phone');
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user && order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Cancel order
// @route PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({ message: `Cannot cancel order in state: ${order.orderStatus}` });
    }

    order.orderStatus = 'Cancelled';
    order.trackingHistory.push({
      status: 'Cancelled',
      comment: req.body.reason || 'Order cancelled by customer.'
    });

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Track order status
// @route GET /api/orders/:id/tracking
const getOrderTracking = async (req, res) => {
  try {
    const param = req.params.id;
    let order;
    if (param.startsWith('DDMB-')) {
      order = await Order.findOne({ orderId: param });
    } else {
      order = await Order.findById(param);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order tracking details not found' });
    }

    res.json({
      orderId: order.orderId,
      currentStatus: order.orderStatus,
      trackingHistory: order.trackingHistory,
      expectedDeliveryDate: order.expectedDeliveryDate,
      deliveryAddressSnapshot: order.deliveryAddressSnapshot,
      advanceRequired: order.advanceRequired,
      advancePaid: order.advancePaid,
      remainingCodAmount: order.remainingCodAmount,
      items: order.items
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  cancelOrder,
  getOrderTracking
};
