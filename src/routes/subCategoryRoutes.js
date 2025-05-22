/**
 * @swagger
 * tags:
 *   name: SubCategories
 *   description: SubCategory management
 */

const express = require('express');
const router = express.Router();
const {
  createSubCategory,
  getSubCategories,
  deleteSubCategory,
} = require('../controllers/subCategoryController');

/**
 * @swagger
 * /api/subcategories:
 *   post:
 *     summary: Create a subcategory and assign to a category
 *     tags: [SubCategories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               categoryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: SubCategory created
 *       400:
 *         description: Bad request
 */
router.post('/', createSubCategory);

/**
 * @swagger
 * /api/subcategories:
 *   get:
 *     summary: Get all subcategories
 *     tags: [SubCategories]
 *     responses:
 *       200:
 *         description: List of subcategories
 */
router.get('/', getSubCategories);

/**
 * @swagger
 * /api/subcategories/{id}:
 *   delete:
 *     summary: Delete a subcategory
 *     tags: [SubCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SubCategory deleted
 *       404:
 *         description: SubCategory not found
 */
router.delete('/:id', deleteSubCategory);

module.exports = router;
