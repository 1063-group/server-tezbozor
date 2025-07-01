const Shop = require('../models/Shop');
const Withdraw = require('../models/Withdraw');
const Product = require('../models/Products')
const User = require('../models/User');
const mongoose = require('mongoose');

// 🔐 UTIL: Check ObjectId validity
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ✅ CREATE SHOP
exports.createShop = async (req, res) => {
  try {
    const seller = req.user;
    console.log('🟨 req.body:', req.body);

    if (seller.role !== 'seller') {
      return res
        .status(403)
        .json({ message: 'Only sellers can create shops.' });
    }

    const { shopname, description, logotype, address, TariffPlan } = req.body;

    if (!shopname || !TariffPlan) {
      return res
        .status(400)
        .json({ message: 'shopname and TariffPlan are required.' });
    }

    // ✅ Fix: Parse location (because it's string in multipart/form-data)
    let location = {};
    if (req.body.location) {
      try {
        location = JSON.parse(req.body.location);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid location format' });
      }
    }

    // ✅ If multer is used and image uploaded
    const logoPath = req.file
      ? `/uploads/shops/${req.file.filename}`
      : logotype;

    const newShop = await Shop.create({
      shopname,
      description,
      logotype: logoPath,
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

// my shops
exports.getMyShops = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const shops = await Shop.find({ owner: sellerId });
    res.status(200).json(shops);
  } catch (err) {
    console.error('❌ Get My Shops Error:', err.message);
    res.status(500).json({ message: 'Server error while fetching shops' });
  }
};

// ✅ GET ALL SHOPS
exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find();

    const shopStats = await Promise.all(
      shops.map(async (shop) => {
        // Komissiya
        let commissionRate = 0.1;
        if (shop.TariffPlan === 'premium') commissionRate = 0.05;
        else if (shop.TariffPlan === 'basic') commissionRate = 0.15;

        // Mahsulotlar
        const products = await Product.find({ shop: shop._id });

        let sale = 0;
        let income = 0;

        products.forEach(product => {
          const sold = product.stock ?? 0;
          const productIncome = product.price?.income ?? 0;

          sale += sold;
          income += productIncome;
        });

        // Withdraws (ixtiyoriy)
        let totalWithdraw = 0;
        if (Withdraw) {
          const withdraws = await Withdraw.find({ shop: shop._id });
          totalWithdraw = withdraws.reduce((sum, w) => sum + w.amount, 0);
        }

        const commissionAmount = income * commissionRate;

        return {
          _id: shop._id,
          shopname: shop.shopname,
          address: shop.address,
          logotype: shop.logotype,
          TariffPlan: shop.TariffPlan,
          commission: `${commissionRate * 100}%`,
          sale,
          balance: income,
          withdraw: totalWithdraw,
        };
      })
    );

    res.json({ success: true, data: shopStats });
  } catch (err) {
    console.error('❌ Admin getAllShopStats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ GET SINGLE SHOP
exports.getShopById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ message: 'Invalid shop ID' });

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
    if (!isValidId(id))
      return res.status(400).json({ message: 'Invalid shop ID' });

    const shop = await Shop.findById(id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    const isOwner = shop.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const updatableFields = [
      'shopname',
      'description',
      'logotype',
      'address',
      'location',
      'TariffPlan',
      'isVerified',
    ];
    updatableFields.forEach((field) => {
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
    if (!isValidId(id))
      return res.status(400).json({ message: 'Invalid shop ID' });

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

    if (!isValidId(id))
      return res.status(400).json({ message: 'Invalid shop ID' });
    if (!from || !to || !reason) {
      return res
        .status(400)
        .json({ message: 'from, to, and reason are required to ban a shop.' });
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
