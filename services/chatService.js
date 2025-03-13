const Chat = require("../models/chat/chat.model");
const mongoose = require("mongoose");

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
        filter.topic = { $in: param.topic };
      }

      if (param.fromDate || param.toDate) {
        filter.createdAt = {};
        if (param.fromDate) filter.createdAt.$gte = new Date(param.fromDate);
        if (param.toDate) filter.createdAt.$lte = new Date(param.toDate);
      }

      const page = param.page ? parseInt(param.page, 10) : 1;
      const limit = param.limit ? parseInt(param.limit, 10) : 10;
      const skip = (page - 1) * limit;

      // 🔥 Dùng aggregate để lấy danh sách chat kèm latestMessage và sắp xếp theo createdAt của latestMessage
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
        { $sort: { "latestMessage.createdAt": -1 } },
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

      console.log("filter:", filter);
      
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
}

module.exports = ChatService;