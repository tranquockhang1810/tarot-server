const express = require("express");
const { loginByOtp, register, loginFacebook, updateUser, getUser, addNewAdmin, loginAdmin } = require("../../controllers/user.controller");
const router = express.Router();
const auth = require("../../middleware/auth");
const upload = require("../../middleware/upload");

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

/**
 * @swagger
 * /api/v1/auth/update:
 *   patch:
 *     summary: Update user information
 *     description: Updates the user's name, avatar, birth date, and gender. The avatar is uploaded as a file.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - birthDate
 *               - gender
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user (minimum 3 characters)
 *                 example: "John Doe"
 *               avatar:
 *                 type: file
 *                 format: binary
 *                 description: Profile picture upload (file format)
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: User's birth date (must be in the past)
 *                 example: "1995-06-15"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: User's gender
 *                 example: "male"
 *     responses:
 *       200:
 *         description: User information updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch("/update", auth(), upload.single("avatar"), updateUser);

/**
 * @swagger
 * /api/v1/auth/user:
 *   get:
 *     summary: Get user information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/user", auth(), getUser);

/**
 * @swagger
 * /api/v1/auth/admin-login:
 *   post:
 *     summary: Admin login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Admin email
 *               password:
 *                 type: string
 *                 description: Admin password
 *     responses:
 *       200:
 *         description: Admin login successful
 *       400:
 *         description: Invalid email or password
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post("/admin-login", loginAdmin);

/**
 * @swagger
 * /api/v1/auth/add-admin:
 *   post:
 *    summary: Add new admin
 *    tags: [Auth]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                description: Admin email
 *              password:
 *                type: string
 *                description: Admin password
 *              name:
 *                type: string
 *                description: Admin name
 *              phone:
 *                type: string
 *                description: Admin phone number
 *    responses:
 *      201:
 *        description: Admin created successfully
 *      400:
 *        description: Invalid input data
 *      401:
 *        description: User not authenticateds
 *      500:
 *        description: Server error
 */
router.post("/add-admin", auth(["admin"]), addNewAdmin);

module.exports = router;
