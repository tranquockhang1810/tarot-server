const express = require("express");
const router = express.Router();
const { 
  getPosts,
  createPost,
  deletePost,
  updatePost
} = require("../../controllers/post.controller");
const upload = require("../../middleware/upload");
const auth = require("../../middleware/auth");

/**
 * @swagger
 * /api/v1/post/list:
 *   get:
 *     summary: Get posts
 *     description: Get paginated list of posts
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of posts per page (default is 10)
 *     responses:
 *       200:
 *         description: Successfully retrieved posts
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/list", auth(), getPosts);

/**
 * @swagger
 * /api/v1/post/create:
 *   post:
 *     summary: Create a post
 *     description: Create a new post with optional images
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Post content
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Post images
 *     responses:
 *       200:
 *         description: Successfully created post
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/create", auth(["admin"]), upload.array("images"), createPost);

/**
 * @swagger
 * /api/v1/post/delete/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Delete a post by ID
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Successfully deleted post
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.delete("/delete/:id", auth(["admin"]), deletePost);

/**
 * @swagger
 * /api/v1/post/update/{id}:
 *   put:
 *     summary: Update a post
 *     description: Update post content, keep/remove/add images
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated content
 *               keepImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of existing image URLs to keep
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New images to upload
 *     responses:
 *       200:
 *         description: Successfully updated post
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.put("/update/:id", auth(["admin"]), upload.array("images"), updatePost);

module.exports = router;
