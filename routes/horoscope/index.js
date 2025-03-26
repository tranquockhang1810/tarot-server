const express = require("express");
const router = express.Router();
const { 
  getDailyHoroscope,
  getUserHoroscopes
} = require("../../controllers/horoscope.controller");
const auth = require("../../middleware/auth");

/**
 * @swagger
 * /api/v1/horoscope/daily:
 *   get:
 *     summary: Get daily horoscope
 *     tags: [Horoscope]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve the daily horoscope
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Language code (e.g., "en" for English, "vi" for Vietnamese)
 *         required: true
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in the format "YYYY-MM-DD"
 *         required: true
 *     responses:
 *       200:
 *         description: Successfully retrieved daily horoscope
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.get("/daily", auth(), getDailyHoroscope);

/**
 * @swagger
 * /api/v1/horoscope/user:
 *   get:
 *     summary: Get user horoscopes
 *     tags: [Horoscope]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve a list of user horoscopes
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Language code (e.g., "en" for English, "vi" for Vietnamese)
 *         required: true
 *     responses:
 *       200:
 *         description: Successfully retrieved user horoscopes
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Internal server error
 */
router.get("/user", auth(), getUserHoroscopes);

module.exports = router;