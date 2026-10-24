const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// Security & Utility Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
// Keep the existing production origins and add deployment-specific frontend origins via CORS_ORIGINS.
const allowedOrigins = [
  'https://www.ddmarket.shop',
  'https://ddmarket.shop',
  'https://dd-mystery.vercel.app',
  'https://dd-mystery-rvt6.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

if (process.env.CORS_ORIGINS) {
  allowedOrigins.push(...process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean));
}

if (process.env.CLIENT_URL) {
  const envOrigin = process.env.CLIENT_URL.trim().replace(/\/$/, '');
  if (!allowedOrigins.includes(envOrigin)) {
    allowedOrigins.push(envOrigin);
  }
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const error = new Error('Origin not allowed by CORS');
    error.status = 403;
    return callback(error);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'x-api-version', 'x-client-id', 'x-client-secret'],
  maxAge: 600,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buffer) => {
    if (req.originalUrl.split('?')[0] === '/api/payments/webhook') {
      req.rawBody = buffer.toString('utf8');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'API Active',
    brand: 'DD MYSTERY BOX',
    tagline: 'Your Birthday. Your Theme. Your Surprise!',
    version: '2.0.0'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/ready', async (req, res, next) => {
  try {
    await connectDB();
    res.json({ status: 'ready', database: 'connected' });
  } catch (error) {
    error.status = 503;
    next(error);
  }
});

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// API Routes Mapping
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/themes', require('./routes/themeRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/rewards', require('./routes/rewardRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// 404 & Error Handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection Intercepted]', {
    name: reason instanceof Error ? reason.name : typeof reason
  });
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception Intercepted]', {
    name: err.name || 'Error',
    code: typeof err.code === 'number' || /^[A-Z0-9_-]+$/i.test(String(err.code || '')) ? err.code : undefined
  });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DD Mystery Box Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
