const express = require('express');
const router = express.Router();
const { createWithdraw, getWithdrawsByShop } = require('../controllers/withdrawController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/withdraws:
 *   post:
 *     summary: Pul yechish so‘rovi yuborish
 *     tags: [Withdraws]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shopId
 *               - amount
 *             properties:
 *               shopId:
 *                 type: string
 *                 description: Do‘kon IDsi
 *               amount:
 *                 type: number
 *                 description: Yechiladigan summa
 *     responses:
 *       201:
 *         description: Yechish so‘rovi yaratildi
 *       400:
 *         description: Noto‘g‘ri so‘rov yoki balans yetarli emas
 */
router.post('/', protect, createWithdraw);

/**
 * @swagger
 * /api/withdraws/shop/{shopId}:
 *   get:
 *     summary: Do‘kon bo‘yicha barcha withdrawlar
 *     tags: [Withdraws]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Withdrawlar ro'yxati
 *       404:
 *         description: Shop topilmadi
 */
router.get('/shop/:shopId', protect, getWithdrawsByShop);

module.exports = router;
