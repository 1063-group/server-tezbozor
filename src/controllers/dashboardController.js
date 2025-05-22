const Order = require('../models/Order');
const Product = require('../models/Products');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.getOrdersAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchQuery = {};

    if (startDate && endDate) {
      matchQuery.createdAt = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    // Agregatsiya: guruhlash oy bo'yicha
    const analysis = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalOrders: { $sum: 1 },
          canceledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Canceled'] }, 1, 0] },
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] },
          },
          revenue: {
            // Faqat yetkazib berilgan (Delivered) buyurtmalar summasi
            $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, '$total', 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET /api/dashboard/summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalProducts, totalRevenue] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Summary error', error: err.message });
  }
};

// GET /api/dashboard/orders-graph
exports.getMonthlyOrderGraph = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } }
    ]);

    const chartData = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, orders: 0 }));
    result.forEach(r => {
      chartData[r._id - 1].orders = r.count;
    });

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ message: 'Order graph error', error: err.message });
  }
};

// GET /api/dashboard/top-products
exports.getTopProducts = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 0,
          name: '$product.name',
          totalSold: 1
        }
      }
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Top products error', error: err.message });
  }
};

// GET /api/dashboard/recent-orders
exports.getRecentOrders = async (req, res) => {
  try {
    const recent = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'username')
      .select('user total status createdAt');

    res.json(recent);
  } catch (err) {
    res.status(500).json({ message: 'Recent orders error', error: err.message });
  }
};

// GET /api/dashboard/shop-performance
exports.getShopPerformance = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.shop',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      {
        $lookup: {
          from: 'shops',
          localField: '_id',
          foreignField: '_id',
          as: 'shop'
        }
      },
      { $unwind: '$shop' },
      {
        $project: {
          shop: '$shop.shopname',
          totalOrders: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Shop performance error', error: err.message });
  }
};
