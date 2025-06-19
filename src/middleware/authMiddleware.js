// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const dotenv = require('dotenv');
dotenv.config();

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      console.log('💡 Secret:', process.env.JWT_SECRET);
      token = req.headers.authorization.split(' ')[1]; // Tokenni olish
      console.log('💡 Token:', token);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Tokenni tekshirish va dekodlash
      console.log("DECODED: ", decoded)
      const user = await User.findById(decoded.id);
      if (!user) {
        return res
          .status(401)
          .json({ message: 'Token bilan foydalanuvchi topilmadi' });
      }
      req.user = user;
      next(); // Middleware’ga o‘tish
    } catch (error) {
      console.error('Token xatosi:', error);
      return res.status(401).json({ message: "Noto'g'ri token" });
    }
  } else {
    return res.status(401).json({ message: 'Token topilmadi' });
  }
};

// Admin uchun middleware
const admin = (req, res, next) => {
  if (
    (req.user && req.user.role === 'CEO') ||
    (req.user && req.user.role === 'admin')
  ) {
    console.log(req.user.role);

    return next(); // Keyingi middleware’ga o‘tish
  }
  return res.status(403).json({ message: 'Admin (CEO) huquqi talab etiladi' });
};

// Cashier uchun middleware
const cashier = (req, res, next) => {
  if (req.user && req.user.role === 'Cashier') {
    // Agar foydalanuvchi cashier bo‘lsa
    return next();
  }
  return res.status(403).json({ message: 'Cashier huquqi talab etiladi' });
};

// Delivery uchun middleware
const delivery = (req, res, next) => {
  if (req.user && req.user.role === 'delivery') {
    // Agar foydalanuvchi delivery bo‘lsa
    return next();
  }
  return res.status(403).json({ message: 'Delivery huquqi talab etiladi' });
};

// Chief uchun middleware
const chief = (req, res, next) => {
  if (req.user && req.user.role === 'chief') {
    // Agar foydalanuvchi chief bo‘lsa
    return next();
  }
  return res.status(403).json({ message: 'Chief huquqi talab etiladi' });
};

// Customer uchun middleware
const customer = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    // Agar foydalanuvchi customer bo‘lsa
    return next();
  }
  return res.status(403).json({ message: 'Customer huquqi talab etiladi' });
};

module.exports = { protect, admin, cashier, delivery, chief, customer };
