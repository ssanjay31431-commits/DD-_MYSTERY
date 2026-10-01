const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'dd_mystery_box_jwt_secret_key_change_in_production_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';

  return jwt.sign({ id }, secret, {
    expiresIn
  });
};

module.exports = generateToken;
module.exports.generateToken = generateToken;
