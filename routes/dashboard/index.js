const express = require("express");
const router = express.Router();
const { 
  getBillDashboard,
  getTopicChart,
  getUserChart
} = require("../../controllers/dashboard.controller");
const auth = require("../../middleware/auth");

/**
 * @swagger
 * /api/v1/dashboard/bill:
 *   get:
 *     summary: Get chart dashboard
 *     description: Get chart dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved topics
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.get("/bill", auth(["admin"]), getBillDashboard);

/**
 * @swagger
 * /api/v1/dashboard/topic:
 *   get:
 *     summary: Get topic dashboard
 *     description: Get topic dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved topics
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.get("/topic", auth(["admin"]), getTopicChart);

/**
 * @swagger
 * /api/v1/dashboard/user:
 *   get:
 *     summary: Get user dashboard
 *     description: Get user dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved topics
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.get("/user", auth(["admin"]), getUserChart);

module.exports = router;