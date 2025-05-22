const Product = require('../models/Products');
const Shop = require('../models/Shop');
const User = require('../models/User');
const StockMovement = require('../models/StockMovement');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// 📌 CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const { name, category, seller, shop, price, stock } = req.body;

    if (!name || !category || !seller || !shop || !price?.costPrice || !price?.sellingPrice || stock == null) {
      return res.status(400).json({ message: 'All fields (name, category, seller, shop, price, stock) are required' });
    }

    const user = await User.findById(seller);
    if (!user || user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can create products' });
    }

    const foundShop = await Shop.findById(shop);
    if (!foundShop || foundShop.owner.toString() !== seller) {
      return res.status(403).json({ message: 'Seller does not own this shop' });
    }

    const product = new Product({ name, category, seller, shop, price, stock });
    await product.save();

    await Shop.findByIdAndUpdate(shop, { $addToSet: { products: product._id } });

    await StockMovement.create({
      product: product._id,
      type: 'incoming',
      quantity: stock,
      note: 'Initial stock on product creation',
      createdBy: seller
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('❌ Create Product Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 📌 GET ALL PRODUCTS
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, shop, sortBy, limit = 20, page = 1 } = req.query;
    const query = {};

    if (search) query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (shop) query.shop = shop;

    const products = await Product.find(query)
      .populate('category seller shop')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort(sortBy ? { [sortBy]: 1 } : { createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({ total, page: Number(page), data: products });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// 📌 GET PRODUCT BY ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid product ID' });

    const product = await Product.findById(id).populate('category seller shop');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.view += 1;
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get product' });
  }
};

// 📌 UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid product ID' });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (req.user.role !== 'admin' && req.user._id.toString() !== product.seller.toString()) {
      return res.status(403).json({ message: 'You do not have permission to update this product' });
    }

    const originalStock = product.stock;
    if (updates.stock != null && updates.stock !== originalStock) {
      const movementType = updates.stock > originalStock ? 'incoming' : 'outgoing';
      const quantity = Math.abs(updates.stock - originalStock);

      await StockMovement.create({
        product: product._id,
        type: movementType,
        quantity,
        note: 'Stock updated via product edit',
        createdBy: req.user._id,
      });
    }

    if (updates.price) {
      updates.price.income = updates.price.sellingPrice - updates.price.costPrice;
    }

    Object.assign(product, updates);
    await product.save();

    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// 📌 DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid product ID' });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (req.user.role !== 'admin' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error during deletion' });
  }
};

// 📊 STOCK SUMMARY
exports.getProductStockSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Mahsulot topilmadi' });

    const movements = await StockMovement.find({ product: id });

    const totalIn = movements.filter(m => m.type === 'incoming').reduce((sum, m) => sum + m.quantity, 0);
    const totalOut = movements.filter(m => m.type === 'outgoing').reduce((sum, m) => sum + m.quantity, 0);
    const totalAdjust = movements.filter(m => m.type === 'adjustment').reduce((sum, m) => sum + m.quantity, 0);

    const currentStock = totalIn - totalOut + totalAdjust;

    res.json({
      product: product.name,
      currentStock,
      totalIn,
      totalOut,
      totalAdjust,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📉 LOW STOCK
exports.getLowStockProducts = async (req, res) => {
  try {
    const all = await Product.find();
    const lowStock = all.filter(p => p.stock <= (p.lowStockThreshold || 10));
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔮 SMART PREDICTION
exports.predictOutOfStock = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid product ID' });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const since = new Date(Date.now() - 30 * 86400000);
    const sales = await StockMovement.find({
      product: id,
      type: 'outgoing',
      createdAt: { $gte: since },
    });

    const totalSold = sales.reduce((sum, r) => sum + r.quantity, 0);
    const avgDailySales = totalSold / 30;

    if (avgDailySales === 0) {
      return res.json({
        product: product.name,
        currentStock: product.stock,
        avgDailySales: 0,
        predictedOutOfStock: null,
        recommendedReorderDate: null,
        message: 'No sales data in the last 30 days. Prediction not available.'
      });
    }

    const daysLeft = product.stock / avgDailySales;
    const predictedOutOfStock = new Date(Date.now() + daysLeft * 86400000);
    const recommendedReorderDate = new Date(predictedOutOfStock.getTime() - 86400000);

    res.json({
      product: product.name,
      currentStock: product.stock,
      avgDailySales: Number(avgDailySales.toFixed(2)),
      predictedOutOfStock,
      recommendedReorderDate
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during prediction' });
  }
};