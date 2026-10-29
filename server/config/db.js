const mongoose = require('mongoose');

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = null;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  const configuredUri = process.env.MONGO_URI.trim();
  const mongoUri = configuredUri
    .replace(/^MONGO_URI\s*=\s*/i, '')
    .replace(/^(['"])([\s\S]*)\1$/, '$2')
    .trim();
  if (!/^mongodb(?:\+srv)?:\/\//.test(mongoUri)) {
    const error = new Error('MONGO_URI must contain only a mongodb:// or mongodb+srv:// connection string');
    error.code = 'INVALID_MONGO_URI';
    throw error;
  }

  connectionPromise = mongoose.connect(mongoUri, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000
  })
    .then((conn) => {
      console.log(`[MongoDB Connected] Host: ${conn.connection.host}`);
      return conn.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      error.status = 503;
      console.error('[MongoDB Connection Error]', {
        name: error.name || 'Error',
        code: typeof error.code === 'number' || /^[A-Z0-9_-]+$/i.test(String(error.code || ''))
          ? error.code
          : undefined
      });
      throw error;
    });

  return connectionPromise;
};

module.exports = connectDB;
