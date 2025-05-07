const Post = require("../models/post/post.model");
const NotificationService = require("./notificationService");

class PostService {
  static async createPost(data) {
    const post = await Post.create(data);
    if (post) {
      await NotificationService.sendNotificationToAllUser({
        title: "Admin Tarot vừa đăng bài viết mới",
        description: post?.content,
      });
      return post;
    } else {
      return null;
    }
  }

  static async getPosts(page, limit) {
    const skip = (page - 1) * limit;
    const posts =  await Post.find()
      .sort({ createdAt: -1 })
      .populate("admin", "name")
      .skip(skip)
      .limit(limit)
      .lean();

    return { posts, paging: {
      total: await Post.countDocuments(),
      page,
      limit,
      totalPages: Math.ceil(await Post.countDocuments() / limit)
    }}
  }

  static async getPost(id) {
    return await Post.findById(id);
  }

  static async updatePost(id, data) {
    return await Post.findByIdAndUpdate(id, data, { new: true });
  }

  static async deletePost(id) {
    return await Post.findByIdAndDelete(id);
  }
}

module.exports = PostService;