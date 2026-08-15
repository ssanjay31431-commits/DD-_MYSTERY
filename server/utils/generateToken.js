const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dd_mystery_box_jwt_secret_key_change_in_production_2026', {
    expiresIn: '30d'
  });
};

module.exports = generateToken;
module.exports.generateToken = generateToken;
