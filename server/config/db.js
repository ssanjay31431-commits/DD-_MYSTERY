const mongoose = require('mongoose');

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  connectionPromise = mongoose.connect(process.env.MONGO_URI)
    .then((conn) => {
      console.log(`[MongoDB Connected] Host: ${conn.connection.host}`);
      return conn.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      console.error(`[MongoDB Connection Error] ${error.message}`);
      throw error;
    });

  return connectionPromise;
};

module.exports = connectDB;
