const Chat = require("../models/chat/chat.model");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const NotificationService = require("./notificationService");

class ChatService {
  static async findChatByID(id) {
    try {
      const chat = await Chat.findById(id);
      return chat;
    } catch (error) {
      console.error("Error finding chat by ID:", error);
      return null;
    }
  }

  static async getChats(param) {
    try {
      const filter = {
        user: mongoose.Types.ObjectId.createFromHexString(param.id)
      };

      if (param.status !== undefined) {
        filter.status = param.status;
      }

      if (param.topic && param.topic.length > 0) {
        filter.topic = { $in: param.topic.map((t) => mongoose.Types.ObjectId.createFromHexString(t)) };
      }

      if (param.fromDate || param.toDate) {
        filter.createdAt = {};
        if (param.fromDate) filter.createdAt.$gte = new Date(param.fromDate);
        if (param.toDate) filter.createdAt.$lte = new Date(new Date(param.toDate).setHours(23, 59, 59, 999));
      }

      const page = param.page ? parseInt(param.page, 10) : 1;
      const limit = param.limit ? parseInt(param.limit, 10) : 10;
      const skip = (page - 1) * limit;

      const chats = await Chat.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "messages",
            localField: "_id",
            foreignField: "chat",
            as: "messages",
          },
        },
        {
          $addFields: {
            latestMessage: { $arrayElemAt: [{ $sortArray: { input: "$messages", sortBy: { createdAt: -1 } } }, 0] }
          },
        },
        { $project: { messages: 0 } },
        { $sort: { createdAt: -1, "latestMessage.createdAt": -1, status: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $addFields: {
            topic: { $toObjectId: "$topic" }
          }
        },
        {
          $lookup: {
            from: "topics",
            localField: "topic",
            foreignField: "_id",
            as: "topic",
          },
        },
        {
          $unwind: {
            path: "$topic",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            topic: { _id: 1, name: 1, image: 1 },
            user: 1,
            question: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            latestMessage: {
              message: 1,
              sender: 1,
              senderType: 1,
              createdAt: 1,
              status: 1,
            },
          },
        },
      ]);

      // 🔥 Lấy tổng số chat
      const totalChatsResult = await Chat.aggregate([
        { $match: filter },
        { $count: "total" },
      ]);

      const totalChats = totalChatsResult.length > 0 ? totalChatsResult[0].total : 0;

      return {
        chats,
        paging: {
          page: page,
          limit: limit,
          total: totalChats,
          totalPages: Math.ceil(totalChats / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching chats:", error);
      return null;
    }
  }

  static async createChat(data) {
    try {
      const chat = await Chat.create(data);
      return chat.populate("topic", "name image");
    } catch (error) {
      return null;
    }
  }

  static async updateOldChats(updateData) {
    try {
      const threeDaysAgo = moment().tz("Asia/Ho_Chi_Minh").subtract(3, "days").format("YYYY-MM-DD");

      console.log(`🕒 Xóa chat trước ngày: ${threeDaysAgo}`);

      const result = await Chat.updateMany(
        { createdAt: { $lt: new Date(`${threeDaysAgo}T00:00:00.000Z`) }, status: true },
        { $set: updateData }
      );

      return result;
    } catch (error) {
      console.error("❌ Error updating old chats:", error);
      return null;
    }
  }

  static async deleteChat(id) {
    try {
      const result = await Chat.findByIdAndDelete(id);
      return result;
    } catch (error) {
      console.error("Error deleting chat:", error);
      return null;
    }
  }

  static async updateCards(chatId, cards) {
    try {
      const result = await Chat.findByIdAndUpdate(chatId, { cards }, { new: true });
      return result;
    } catch (error) {
      console.error("Error updating cards:", error);
      return null;
    }
  }

  static async checkUsersChatValid() {
    try {
      const now = moment().tz("Asia/Ho_Chi_Minh").startOf("day");
      const twoDaysAgo = now.clone().subtract(2, "days").format("YYYY-MM-DD");
      const oneDayAgo = now.clone().subtract(1, "days").format("YYYY-MM-DD");

      // Tìm các đoạn chat tạo vào đúng 2 ngày trước (tức chỉ còn 1 ngày nữa là hết hạn)
      const result = await Chat.aggregate([
        {
          $match: {
            status: true,
            createdAt: {
              $gte: new Date(`${twoDaysAgo}T00:00:00.000Z`),
              $lt: new Date(`${oneDayAgo}T00:00:00.000Z`),
            }
          }
        },
        {
          $group: {
            _id: "$user",
            count: { $sum: 1 }
          }
        }
      ]);

      // Chuyển thành Map<userId, count>
      const userChatMap = new Map();
      result.forEach(item => {
        userChatMap.set(item._id.toString(), item.count);
      });

      userChatMap.forEach(async (value, key) => {
        await NotificationService.createNotification({
          user: key,
          title: "Đoạn chat sắp hết hạn",
          description: `Bạn có ${value} đoạn chat sẽ hết hạn trong 24h tới`,
        });
      });

      return userChatMap;

    } catch (error) {
      console.error("❌ Error checking chat validity:", error);
      return new Map();
    }
  }
}

module.exports = ChatService;