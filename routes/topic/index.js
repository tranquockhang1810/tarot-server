const express = require("express");
const router = express.Router();
const { 
  getTopicList,
  addTopic
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

/**
 * @swagger
 * /api/v1/topic/add:
 *   post:
 *     summary: Add topic
 *     description: Add topic
 *     tags: [Topic]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Topic name
 *               code:
 *                 type: string
 *                 description: Topic code
 *               image:
 *                 type: string
 *                 description: Topic image
 *               price:
 *                 type: number
 *                 description: Topic price
 *     responses:
 *       200:
 *         description: Successfully added topic
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.post("/add", auth(), addTopic);

module.exports = router;