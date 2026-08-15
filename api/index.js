const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Shared Serverless Memory Store
let inMemoryOrders = [];

// Helper to register order safely
const registerOrderInStore = (orderData) => {
  if (!orderData) return null;
  const newOrder = {
    _id: orderData._id || `ord_${Date.now()}`,
    orderId: orderData.orderId || `DD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    user: {
      _id: orderData.user?._id || `usr_${Date.now()}`,
      name: orderData.user?.name || orderData.deliveryAddressSnapshot?.fullName || orderData.deliveryAddress?.fullName || 'Customer',
      email: orderData.user?.email || orderData.deliveryAddressSnapshot?.email || orderData.deliveryAddress?.email || 'customer@example.com',
      phone: orderData.user?.phone || orderData.deliveryAddressSnapshot?.mobileNumber || orderData.deliveryAddress?.mobileNumber || '9876543210'
    },
    deliveryAddressSnapshot: orderData.deliveryAddressSnapshot || orderData.deliveryAddress || {},
    items: orderData.items || [],
    subtotal: Number(orderData.subtotal) || 499,
    deliveryFee: Number(orderData.deliveryFee) || 0,
    couponDiscount: Number(orderData.couponDiscount) || 0,
    couponCode: orderData.couponCode || '',
    totalAmount: Number(orderData.totalAmount) || 499,
    advancePaid: Number(orderData.advancePaid) || (orderData.paymentMethod === 'full_cod' ? 0 : 100),
    remainingCodAmount: Number(orderData.remainingCodAmount) || (orderData.paymentMethod === 'full_cod' ? 499 : 399),
    paymentMethod: orderData.paymentMethod || 'cod_advance',
    paymentStatus: orderData.paymentStatus || 'Confirmed',
    orderStatus: orderData.orderStatus || 'Confirmed',
    createdAt: orderData.createdAt || new Date().toISOString()
  };

  inMemoryOrders = [newOrder, ...inMemoryOrders.filter(o => o._id !== newOrder._id && o.orderId !== newOrder.orderId)];
  return newOrder;
};

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'Active', brand: 'DD MYSTERY BOX', serverless: true, count: inMemoryOrders.length });
});

app.post('/api/orders', (req, res) => {
  const order = registerOrderInStore(req.body);
  res.status(201).json(order);
});

app.get('/api/orders', (req, res) => {
  res.json(inMemoryOrders);
});

app.get('/api/orders/admin/all', (req, res) => {
  res.json(inMemoryOrders);
});

app.get('/api/admin/orders', (req, res) => {
  res.json(inMemoryOrders);
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  const { orderStatus } = req.body;
  const id = req.params.id;
  inMemoryOrders = inMemoryOrders.map(o => (o._id === id || o.orderId === id) ? { ...o, orderStatus } : o);
  res.json({ success: true, orderStatus });
});

app.get('/api/admin/dashboard', (req, res) => {
  const totalRev = inMemoryOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const advanceColl = inMemoryOrders.reduce((acc, o) => acc + (o.advancePaid || 0), 0);
  const codColl = inMemoryOrders.reduce((acc, o) => acc + (o.remainingCodAmount || 0), 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRev = inMemoryOrders
    .filter((o) => o.createdAt && o.createdAt.startsWith(todayStr))
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  res.json({
    totalRevenue: totalRev,
    todayRevenue: todayRev,
    advanceCollected: advanceColl,
    expectedCodCollection: codColl,
    totalOrders: inMemoryOrders.length,
    pendingOrders: inMemoryOrders.filter(o => o.orderStatus !== 'Delivered').length,
    deliveredOrders: inMemoryOrders.filter(o => o.orderStatus === 'Delivered').length,
    totalCustomers: new Set(inMemoryOrders.map(o => o.user?.email)).size,
    averageOrderValue: Math.round(totalRev / (inMemoryOrders.length || 1)),
    popularThemes: [],
    recentOrders: inMemoryOrders
  });
});

app.get('/api/admin/customers', (req, res) => {
  const map = {};
  inMemoryOrders.forEach((ord) => {
    const email = ord.user?.email || 'customer@example.com';
    if (!map[email]) {
      map[email] = {
        _id: `cust_${email}`,
        name: ord.user?.name || 'Customer',
        email,
        phone: ord.user?.phone || 'N/A',
        googleId: email.includes('gmail.com'),
        totalOrders: 0,
        totalSpent: 0,
        createdAt: ord.createdAt
      };
    }
    map[email].totalOrders += 1;
    map[email].totalSpent += (ord.totalAmount || 0);
  });
  res.json(Object.values(map));
});

app.post('/api/cart/add', (req, res) => {
  res.json({ success: true, items: req.body.items || [] });
});

app.delete('/api/cart/clear', (req, res) => {
  res.json({ success: true });
});

app.post('/api/payments/create-order', (req, res) => {
  res.json({
    id: `pay_${Date.now()}`,
    amount: 10000,
    currency: 'INR',
    isMockMode: true
  });
});

app.post('/api/payments/verify', (req, res) => {
  res.json({ success: true });
});

app.use((req, res) => {
  res.status(200).json({ status: 'OK', active: true });
});

module.exports = app;
