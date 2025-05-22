const Shop = require('../models/Shop');
const User = require('../models/User');
const mongoose = require('mongoose');

// 🔐 UTIL: Check ObjectId validity
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ✅ CREATE SHOP
exports.createShop = async (req, res) => {
  try {
    const seller = req.user;

    if (seller.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can create shops.' });
    }

    const { shopname, description, logotype, address, location, TariffPlan } = req.body;

    if (!shopname || !TariffPlan) {
      return res.status(400).json({ message: 'shopname and TariffPlan are required.' });
    }

    const exists = await Shop.findOne({ owner: seller._id });
    if (exists) {
      return res.status(409).json({ message: 'You already own a shop.' });
    }

    const newShop = await Shop.create({
      shopname,
      description,
      logotype,
      address,
      location,
      TariffPlan,
      owner: seller._id,
    });

    res.status(201).json({ success: true, shop: newShop });
  } catch (err) {
    console.error('❌ Shop creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ GET ALL SHOPS
exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find()
      .populate('owner', 'username email')
      .populate('products');

    res.status(200).json({ success: true, total: shops.length, data: shops });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch shops' });
  }
};

// ✅ GET SINGLE SHOP
exports.getShopById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid shop ID' });

    const shop = await Shop.findById(id)
      .populate('owner', 'username')
      .populate('products');

    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    shop.view += 1;
    await shop.save();

    res.status(200).json(shop);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ EDIT SHOP
exports.editShop = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid shop ID' });

    const shop = await Shop.findById(id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const isOwner = shop.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const updatableFields = ['shopname', 'description', 'logotype', 'address', 'location', 'TariffPlan', 'isVerified'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) shop[field] = req.body[field];
    });

    await shop.save();
    res.json({ message: 'Shop updated', shop });
  } catch (err) {
    res.status(500).json({ message: 'Could not update shop' });
  }
};

// ✅ DELETE SHOP
exports.deleteShop = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid shop ID' });

    const shop = await Shop.findById(id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const isOwner = shop.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await shop.deleteOne();
    res.json({ message: 'Shop deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ BAN SHOP
exports.banShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to, reason } = req.body;

    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid shop ID' });
    if (!from || !to || !reason) {
      return res.status(400).json({ message: 'from, to, and reason are required to ban a shop.' });
    }

    const shop = await Shop.findById(id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    shop.isBanned = {
      status: true,
      from: new Date(from),
      to: new Date(to),
      reason,
    };

    await shop.save();
    res.json({ message: 'Shop banned successfully', banned: shop.isBanned });
  } catch (err) {
    res.status(500).json({ message: 'Could not ban shop' });
  }
};
