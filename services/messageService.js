const Chat = require("../models/chat/chat.model");
const Message = require("../models/message/message.model");

class MessageService {
  static async getMessages(chatID, page = 1, limit = 10) {
    try {
      const chat = await Chat.findById(chatID)
        .select("_id topic status question cards createdAt")
        .populate("topic", "name image")
        .lean();

      if (!chat) return null;

      // ✅ Tính toán skip để paging
      const skip = (page - 1) * limit;

      // ✅ Lấy danh sách tin nhắn **mới nhất trước**
      const messages = await Message.find({ chat: chatID })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // ✅ Lấy tổng số tin nhắn để tính totalPages
      const totalMessages = await Message.countDocuments({ chat: chatID });

      return {
        data: {
          ...chat,
          messages,
        },
        paging: {
          total: totalMessages,
          page,
          limit,
          totalPages: Math.ceil(totalMessages / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching chat:", error);
      return null;
    }
  }

  static async createMessage(chatID, sender, senderType, message, status = true) {
    try {
      const newMessage = new Message({
        chat: chatID,
        sender,
        senderType,
        message,
        status,
      });
      return await newMessage.save();
    } catch (error) {
      console.error("❌ Error saving message to DB:", error);
      return null;
    }
  }

  static async getAIResponseAndSave(chatID, userMessage) {
    try {
      // 🔥 Gọi API AI để lấy phản hồi
      const aiResponse = await new Promise((resolve) => {
        setTimeout(() => {
          resolve("Tin nhắn tự động vào lúc " + new Date().toLocaleString());
        }, 5000); // 5 giây
      });

      return await MessageService.createMessage(chatID, null, "ai", aiResponse, false);
    } catch (error) {
      console.error("❌ Error getting AI response:", error);
      return null;
    }
  }

  static async updateMessagesStatus(chatId) {
    try {
      return await Message.updateMany(
        { chat: chatId, status: false },
        { $set: { status: true } }
      );
    } catch (error) {
      console.error("❌ Error updating message status:", error);
    }
  }
}

module.exports = MessageService;