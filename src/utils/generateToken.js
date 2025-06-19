const jwt = require('jsonwebtoken');
require('dotenv').config(); // 🟢 Shart!

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
