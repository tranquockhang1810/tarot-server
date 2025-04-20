const PostService = require("../services/postService");
const UploadService = require("../services/uploadService");

const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    if (isNaN(page) || page < 1) {
      return next({ status: 400, message: "Page must be a positive number" });
    }
    if (isNaN(limit) || limit < 1) {
      return next({ status: 400, message: "Limit must be a positive number" });
    }

    const { posts, paging } = await PostService.getPosts(parseInt(page, 10), parseInt(limit, 10));

    return res.status(200).json({
      code: 200,
      message: "Posts fetched successfully",
      data: posts,
      paging
    });
  } catch (error) {
    next(error);
  }
}

const createPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;
    let images = [];

    if (!content) {
      return next({ status: 400, message: "Content is required" });
    }

    if (req.files) {
      images = await UploadService.uploadMultiple(req.files);
    }

    const post = await PostService.createPost({ admin: userId, content, images });

    return res.status(200).json({
      code: 200,
      message: "Post created successfully",
      data: post
    });
  } catch (error) {
    next(error);
  }
}

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next({ status: 400, message: "Post ID is required" });
    }

    // 1. Tìm post
    const post = await PostService.getPost(id);
    if (!post) {
      return next({ status: 404, message: "Post not found" });
    }

    // 2. Nếu có hình, xóa hình
    if (post.images && post.images.length > 0) {
      await Promise.all(
        post.images.map(async (imageUrl) => {
          const publicId = UploadService.extractPublicIdFromUrl(imageUrl);
          if (publicId) {
            await UploadService.deleteFile(publicId);
          }
        })
      );
    }

    // 3. Xóa post trong database
    const deletedPost = await PostService.deletePost(id);

    return res.status(200).json({
      code: 200,
      message: "Post deleted successfully",
      data: deletedPost,
    });
  } catch (error) {
    next(error);
  }
};


const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    let keepImages = req.body.keepImages || [];

    if (typeof keepImages === "string") {
      keepImages = [keepImages];
    }

    let newImages = [];

    if (!id) {
      return next({ status: 400, message: "Post ID is required" });
    }
    if (!content) {
      return next({ status: 400, message: "Content is required" });
    }

    // Lấy post hiện tại
    const post = await PostService.getPost(id);
    if (!post) {
      return next({ status: 404, message: "Post not found" });
    }

    // Tìm các ảnh cũ cần xóa
    const oldImages = post.images || [];
    const imagesToDelete = oldImages.filter(url => !keepImages.includes(url));

    // Upload ảnh mới (nếu có)
    if (req.files && req.files.length > 0) {
      newImages = await UploadService.uploadMultiple(req.files);
    }

    const finalImages = [...keepImages, ...newImages];

    // Cập nhật post
    const updatedPost = await PostService.updatePost(id, {
      content,
      images: finalImages,
    });

    // Xóa ảnh cũ trên Cloudinary
    if (imagesToDelete.length > 0) {
      await Promise.all(imagesToDelete.map(url => UploadService.deleteFile(url)));
    }

    return res.status(200).json({
      code: 200,
      message: "Post updated successfully",
      data: updatedPost
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getPosts, createPost, deletePost, updatePost };