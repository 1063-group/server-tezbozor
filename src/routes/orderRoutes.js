const express = require('express');
const {
  createOrder,
  updateOrder,
  deleteOrders,
  getAllOrders,
  getUserOrders,
} = require('../controllers/orderController.js');
const { protect, admin, customer } = require('../middleware/authMiddleware.js');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Orders API endpoints
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: View all orders
 *     description: Returns a list of all orders for the CEO.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Admin access required
 */
router.get('/', getAllOrders);

/**
 * @swagger
 * /api/orders/myorders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: View user's orders
 *     description: Returns a list of orders placed by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 *       401:
 *         description: User not authenticated
 */
router.get('/myorders', getUserOrders);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create a new order
 *     description: Allows a customer to create a new order.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 description: List of products in the order
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Product ID
 *                     name:
 *                       type: string
 *                       description: Product name
 *                     basketquantity:
 *                       type: integer
 *                       description: Quantity
 *                     price:
 *                       type: object
 *                       properties:
 *                         sellingPrice:
 *                           type: number
 *                           description: Price per unit
 *               address:
 *                 type: object
 *                 description: Delivery address details
 *                 properties:
 *                   city:
 *                     type: string
 *                     description: City
 *                   street:
 *                     type: string
 *                     description: Street and house number
 *                   phone:
 *                     type: string
 *                     description: Contact phone number
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                         description: Latitude
 *                       lon:
 *                         type: number
 *                         description: Longitude
 *               total:
 *                 type: number
 *                 description: Total order amount
 *               paymentMethod:
 *                 type: string
 *                 description: Payment method (Payme, Uzum, Click, Cash)
 *             required:
 *               - products
 *               - address
 *               - total
 *               - paymentMethod
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid order data
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Customer access required
 */
router.post('/', protect, customer, createOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     tags:
 *       - Orders
 *     summary: Update an order
 *     description: Allows the CEO to update order details.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the order to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 description: Updated list of products
 *               total:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [Pending, Processing, Preparing, Delivered, Canceled]
 *               paymentMethod:
 *                 type: string
 *                 enum: [Cash, Card, Online]
 *               deliveryDetails:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   contactNumber:
 *                     type: string
 *                   instructions:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                       lon:
 *                         type: number
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Invalid order data
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Order not found
 */
router.put('/:id', protect, admin, updateOrder);

/**
 * @swagger
 * /api/orders:
 *   delete:
 *     tags:
 *       - Orders
 *     summary: Delete multiple orders
 *     description: Allows the CEO to delete multiple orders by IDs.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 description: List of order IDs to delete
 *                 items:
 *                   type: string
 *             required:
 *               - ids
 *     responses:
 *       200:
 *         description: Orders deleted successfully
 *       400:
 *         description: Invalid IDs provided
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: Admin access required
 */
router.delete('/', protect, admin, deleteOrders);

module.exports = router;