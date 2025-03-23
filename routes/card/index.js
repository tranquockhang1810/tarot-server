const express = require("express");
const router = express.Router();
const {
  addCard,
  getAllCards,
  getAllCardsRandom
} = require('../../controllers/card.controller');
const auth = require("../../middleware/auth");

/**
 * @swagger
 * /api/v1/card/add:
 *   post:
 *     summary: Add a new card
 *     tags: [Card]
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
 *                 description: Name of the card
 *     responses:
 *       200:
 *         description: Successfully added a new card
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
*/
router.post("/add", auth(), addCard);

/**
 * @swagger
 * /api/v1/card/list:
 *   get:
 *     summary: Get all cards
 *     tags: [Card]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve a list of all cards
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
 *         description: Successfully retrieved all cards
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
*/
router.get("/list", auth(), getAllCards);

/**
 * @swagger
 * /api/v1/card/random:
 *   get:
 *     summary: Get a random card
 *     tags: [Card]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved a random card
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
*/
router.get("/random", auth(), getAllCardsRandom);

module.exports = router;