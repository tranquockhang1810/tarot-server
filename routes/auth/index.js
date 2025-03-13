const express = require("express");
const { loginByOtp, register, loginFacebook } = require("../../controllers/user.controller");
const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/login-by-otp:
 *   post:
 *     summary: Verify phone number using Firebase ID Token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Firebase ID Token received after OTP verification
 *     responses:
 *       200:
 *         description: Successfully verified phone number
 *       400:
 *         description: Invalid phone number
 *       401:
 *         description: Invalid ID Token
 *       500:
 *         description: Server error
 */
router.post("/login-by-otp", loginByOtp);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Full name (min 3 characters)
 *               name:
 *                 type: string
 *                 description: Full name (min 3 characters)
 *               phone:
 *                 type: string
 *                 description: Phone number (exactly 10 characters)
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: Birth date in the past
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: Gender (male or female)
 *               type:
 *                 type: string
 *                 enum: [phone, facebook]
 *                 description: Registration type (phone or facebook)
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/register", register);

/**
 * @swagger
 * /api/v1/auth/login-by-facebook:
 *   post:
 *     summary: Login with Facebook
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: Facebook access token received after login
 *     responses:
 *       200:
 *         description: Successfully login with Facebook
 *       400:
 *         description: Invalid facebook id
 *       500:
 *         description: Server error
 */
router.post("/login-by-facebook", loginFacebook);

module.exports = router;
