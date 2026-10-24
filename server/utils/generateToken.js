const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';

  return jwt.sign({ id }, secret, {
    expiresIn
  });
};

module.exports = generateToken;
module.exports.generateToken = generateToken;
