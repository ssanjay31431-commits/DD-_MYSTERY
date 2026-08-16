const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const verifyBrevoSmtp = async () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.BREVO_SENDER_EMAIL) {
    console.warn('[EMAIL SMTP] SMTP not configured yet. Skipping verification.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    await transporter.verify();
    console.log('[EMAIL SMTP] Connection verified');
    console.log('[EMAIL CONFIG]', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      sender: process.env.BREVO_SENDER_EMAIL
    });
  } catch (error) {
    console.error('[EMAIL SMTP] Connection failed');
    console.error(error.message);
  }
};

// Connect MongoDB
connectDB();

const app = express();

// Security & Utility Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
// Dynamic & Permissive CORS to prevent origin blocking across Vercel, Render & Localhost
const allowedOrigins = [
  'https://dd-mystery.vercel.app',
  'https://dd-mystery.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

if (process.env.CLIENT_URL) {
  const envOrigin = process.env.CLIENT_URL.trim().replace(/\/$/, '');
  if (!allowedOrigins.includes(envOrigin)) {
    allowedOrigins.push(envOrigin);
  }
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, '*');
    }

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, origin);
    }

    return callback(null, origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'x-api-version', 'x-client-id', 'x-client-secret'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
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

verifyBrevoSmtp();

app.listen(PORT, () => {
  console.log(`[DD Mystery Box Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
