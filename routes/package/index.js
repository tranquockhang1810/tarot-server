const express = require("express");
const router = express.Router();
const { 
  createPackage,
  getPackagesList
} = require("../../controllers/package.controller");
const auth = require("../../middleware/auth");

/**
 * @swagger
 * /api/v1/package/list:
 *   get:
 *     summary: Get package list
 *     description: Get package list
 *     tags: [Package]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved packages
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.get("/list", auth(), getPackagesList);

/**
 * @swagger
 * /api/v1/package/add:
 *   post:
 *     summary: Add package
 *     description: Add package
 *     tags: [Package]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: package description
 *               point:
 *                 type: number
 *                 description: package point
 *                 required: true
 *               price:
 *                 type: number
 *                 description: package price
 *                 required: true
 *     responses:
 *       200:
 *         description: Successfully added package
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.post("/add", auth(), createPackage);

module.exports = router;