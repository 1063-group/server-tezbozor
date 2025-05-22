/**
 * @swagger
 * tags:
 *   name: Shops
 *   description: Do'konlar bilan ishlash (seller/admin)
 */

const express = require('express');
const router = express.Router();
const {
  createShop,
  getAllShops,
  getShopById,
  editShop,
  deleteShop,
  banShop,
} = require('../controllers/shopController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/shops:
 *   post:
 *     summary: Create a new shop (Seller only)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shopname
 *               - TariffPlan
 *             properties:
 *               shopname:
 *                 type: string
 *               description:
 *                 type: string
 *               logotype:
 *                 type: string
 *               address:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lon:
 *                     type: number
 *               TariffPlan:
 *                 type: string
 *                 enum: [basic, standard, premium]
 *     responses:
 *       201:
 *         description: Shop created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Shop already exists
 */
router.post(
  '/',
  protect,
  (req, res, next) => {
    if (req.user.role !== 'seller') return res.status(403).json({ message: 'Only sellers can create shops' });
    next();
  },
  createShop
);

/**
 * @swagger
 * /api/shops:
 *   get:
 *     summary: Get all shops (Public)
 *     tags: [Shops]
 *     responses:
 *       200:
 *         description: List of shops
 */
router.get('/', getAllShops);

/**
 * @swagger
 * /api/shops/{id}:
 *   get:
 *     summary: Get single shop by ID
 *     tags: [Shops]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shop details
 *       404:
 *         description: Shop not found
 */
router.get('/:id', getShopById);

/**
 * @swagger
 * /api/shops/{id}:
 *   put:
 *     summary: Edit shop (owner or admin)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shopname:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               TariffPlan:
 *                 type: string
 *                 enum: [basic, standard, premium]
 *     responses:
 *       200:
 *         description: Shop updated
 *       403:
 *         description: Access denied
 */
router.put('/:id', protect, editShop);

/**
 * @swagger
 * /api/shops/{id}:
 *   delete:
 *     summary: Delete a shop (owner or admin)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shop deleted
 *       403:
 *         description: Access denied
 */
router.delete('/:id', protect, deleteShop);

/**
 * @swagger
 * /api/shops/ban/{id}:
 *   put:
 *     summary: Ban a shop (admin only)
 *     tags: [Shops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - from
 *               - to
 *               - reason
 *             properties:
 *               from:
 *                 type: string
 *                 format: date-time
 *               to:
 *                 type: string
 *                 format: date-time
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shop banned
 *       404:
 *         description: Shop not found
 */
router.put('/ban/:id', protect, admin, banShop);

module.exports = router;
