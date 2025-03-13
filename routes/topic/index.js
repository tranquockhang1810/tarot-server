const express = require("express");
const router = express.Router();
const { 
  getTopicList
} = require("../../controllers/topic.controller");
const auth = require("../../middleware/auth");

/**
 * @swagger
 * /api/v1/topic/list:
 *   get:
 *     summary: Get topic list
 *     description: Get topic list
 *     tags: [Topic]
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
router.get("/list", auth(), getTopicList);

module.exports = router;