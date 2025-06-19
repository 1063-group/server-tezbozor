const User = require('../models/User.js');
const generateToken = require('../utils/generateToken.js');

// Register foydalanuvchi
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: 'Foydalanuvchi allaqachon mavjud' });
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      img: user.img,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login foydalanuvchi
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Foydalanuvchi topilmadi' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Noto'g'ri parol" });
    }

    const token = generateToken(user._id, user.role); // 🟢 token yaratish

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      img: user.img,
      role: user.role,
      token, // 🟢 token qaytarish
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seller ro'yxatdan o'tkazish
const registerSeller = async (req, res) => {
  const { username, email, password, storeDescription, storeName} = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: 'Foydalanuvchi allaqachon mavjud' });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: 'seller',
      storeDescription,
      storeName
    });
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      img: user.img,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // не возвращать пароль
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Customer ro'yxatdan o'tkazish
const registerCustomer = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: 'Foydalanuvchi allaqachon mavjud' });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: 'customer',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      img: user.img,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerCustomer,
  registerUser,
  loginUser,
  registerSeller,
  getAllUsers, // 🟢 не забудь экспортировать
};
