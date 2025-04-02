const express = require("express");
const router = express.Router();
const {
  createBill,
  paymentSuccess,
  getBillList
} = require("../../controllers/bill.controller");
const auth = require("../../middleware/auth");

/**
 * @swagger
 * /api/v1/bill/create:
 *   post:
 *     summary: Create a new bill
 *     tags: [Bill]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true 
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageId:
 *                 type: string
 *                 description: Package id
 *               returnUrl:
 *                 type: string
 *                 description: Return url
 *     responses:
 *       200:
 *         description: Successfully created a new bill
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.post("/create", auth(), createBill);

/**
 * @swagger
 * /api/v1/bill/success:
 *   post:
 *     summary: Payment success
 *     tags: [Bill]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true 
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Order id
 *               resultCode:
 *                 type: number
 *                 description: Result code
 *     responses:
 *       200:
 *         description: Payment success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.post("/success", auth(), paymentSuccess);

/**
 * @swagger
 * /api/v1/bill/list:
 *   get:
 *     summary: Get bill list
 *     description: Get bill list
 *     tags: [Bill]
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [package, point]
 *         description: Filter by type
 *     responses:
 *       200:
 *         description: Successfully retrieved bills
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.get("/list", auth(), getBillList);

module.exports = router;