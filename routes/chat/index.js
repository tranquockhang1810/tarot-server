const express = require("express");
const router = express.Router();
const { 
  createChat, 
  getChats,
  getChat 
} = require("../../controllers/chat.controller");
const auth = require("../../middleware/auth");

/**
 * @swagger
 * /api/v1/chat/create:
 *   post:
 *     summary: Create a new chat session
 *     description: This endpoint creates a new chat session for a user.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *               - question
 *               - cards
 *             properties:
 *               topic:
 *                 type: string
 *                 example: "topic-456"
 *                 description: ID of the topic selected for the chat
 *               question:
 *                 type: string
 *                 example: "What does my future hold?"
 *                 description: User's question for the chat
 *               cards:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["card-1", "card-2", "card-3"]
 *                 description: List of selected tarot cards
 *     responses:
 *       200:
 *         description: Chat created successfully
 *       400:
 *         description: Bad request, missing required fields
 *       401:
 *         description: Unauthorized, invalid token
 *       403:
 *         description: Forbidden, user does not have permission
 *       500:
 *         description: Internal server error
 */
router.post("/create", auth(), createChat);

/**
 * @swagger
 * /api/v1/chat/list:
 *   get:
 *     summary: Get chats by filters
 *     description: Retrieve chat history filtered by status, topic, date range, and user ID.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: boolean
 *         description: Filter by chat status (true for active, false for closed)
 *       - in: query
 *         name: topic
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Array of topic IDs to filter chats
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter chats created after this date (YYYY-MM-DD)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter chats created before this date (YYYY-MM-DD)
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
 *         description: Successfully retrieved chats
 *       400:
 *         description: Bad request (e.g., invalid topic ID or date format)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.get("/list", auth(), getChats);

/**
 * @swagger
 * /api/v1/chat/detail:
 *   get:
 *     summary: Get chat by ID
 *     description: Retrieve a specific chat session by its ID.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the chat session to retrieve
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
 *         description: Successfully retrieved chat session
 *       400:
 *         description: Bad request (e.g., invalid chat ID)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.get("/detail", auth(), getChat);

module.exports = router;