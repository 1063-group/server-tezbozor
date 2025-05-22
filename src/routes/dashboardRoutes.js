const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware.js');
const router = express.Router();
const {
  getDashboardSummary,
  getMonthlyOrderGraph,
  getTopProducts,
  getRecentOrders,
  getOrdersAnalysis,
  getShopPerformance,
} = require('../controllers/dashboardController');

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Dashboardlar ro'yhati
 */

/**
 * @swagger
 * /api/dashboard/orders-analysis:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Buyurtmalar tahlili
 *     description: "Sana intervali bo'yicha buyurtmalar, bekor qilinganlar, yetkazilganlar va daromad hisobini qaytaradi. (FAQAT CEO uchun)"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: "Filtrlash boshlanish sanasi (masalan: 2024-01-01)"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: "Filtrlash tugash sanasi (masalan: 2024-12-31)"
 *     responses:
 *       200:
 *         description: "Buyurtmalar tahlili natijalari"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: number
 *                     description: "Oy raqami (1-12)"
 *                   totalOrders:
 *                     type: number
 *                   canceledOrders:
 *                     type: number
 *                   deliveredOrders:
 *                     type: number
 *                   revenue:
 *                     type: number
 *       401:
 *         description: "Foydalanuvchi autentifikatsiyadan o'tmagan"
 *       403:
 *         description: "Admin huquqi talab etiladi"
 */
router.get('/orders-analysis', protect, admin, getOrdersAnalysis); // ✅

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Admin panel statistik APIlari
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Asosiy statistik ma'lumotlar
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistika ma'lumotlari
 */
router.get('/summary', protect, admin, getDashboardSummary);

/**
 * @swagger
 * /api/dashboard/orders-graph:
 *   get:
 *     summary: Oylik buyurtmalar soni (grafik uchun)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Har oyga qarab buyurtmalar soni
 */
router.get('/orders-graph', protect, admin, getMonthlyOrderGraph);

/**
 * @swagger
 * /api/dashboard/top-products:
 *   get:
 *     summary: Eng ko'p sotilgan mahsulotlar
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Eng ko'p sotilgan 5 mahsulot
 */
router.get('/top-products', protect, admin, getTopProducts);

/**
 * @swagger
 * /api/dashboard/recent-orders:
 *   get:
 *     summary: So'nggi 10 ta buyurtma
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: So'nggi buyurtmalar ro'yxati
 */
router.get('/recent-orders', protect, admin, getRecentOrders);

/**
 * @swagger
 * /api/dashboard/shop-performance:
 *   get:
 *     summary: Har bir shop bo'yicha buyurtma va daromad
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shop performance statistika
 */
router.get('/shop-performance', protect, admin, getShopPerformance);

module.exports = router;
