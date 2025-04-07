const express = require("express");
const router = express.Router();
const {
  getNotification
} = require("../../controllers/notification.controller");
const auth = require("../../middleware/auth");

/**
 * @swagger
 * /api/v1/notification/list:
 *   get:
 *     summary: Get notification list
 *     description: Get notification list
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         type: number
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.get("/list", auth(), getNotification);

module.exports = router;