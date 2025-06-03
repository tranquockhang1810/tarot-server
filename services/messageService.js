const Chat = require("../models/chat/chat.model");
const Message = require("../models/message/message.model");
const GeminiService = require("../services/geminiService");
const UserService = require("./userService");

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

  static async getAIResponseAndSave(chatID, userMessage, userID) {
    try {
      const chat = await Chat.findById(chatID).populate('topic');
      const user = await UserService.findUserById(userID);
      // 1. Giai đoạn mới tạo
      if (chat.stage === 'initial') {
        const questions = await GeminiService.askFollowUpQuestions(chat.topic.name, chat.question, user);
        chat.followUpQuestions = questions.slice(1);
        chat.followUpAnswers = [];
        chat.currentFollowUpIndex = 0;
        chat.stage = 'awaiting_answer';
        await chat.save();
        await this.createMessage(chatID, null, 'ai', questions[0], false);

        const currentQuestion = chat.followUpQuestions[0];
        await this.createMessage(chatID, null, 'ai', currentQuestion, false);
        return currentQuestion;
      }

      // 2. Đang chờ user trả lời từng câu
      if (chat.stage === 'awaiting_answer') {
        const idx = chat.currentFollowUpIndex;
        const currentQuestion = chat.followUpQuestions[idx];

        // Validate câu trả lời
        const isValid = await GeminiService.validateSingleAnswer(
          chat.topic.name,
          chat.question,
          currentQuestion,
          userMessage
        );

        if (!isValid) {
          const retryMsg = `Cảm ơn bạn, vui lòng trả lời rõ hơn cho câu hỏi: "${currentQuestion}"`;
          await this.createMessage(chatID, null, 'ai', retryMsg, false);
          return retryMsg;
        }

        // Câu trả lời hợp lệ
        chat.followUpAnswers.push(userMessage);
        chat.currentFollowUpIndex += 1;

        // Đã trả lời hết 3 câu
        if (chat.currentFollowUpIndex >= chat.followUpQuestions.length) {
          chat.stage = 'interpreted';
          await chat.save();

          if (!Array.isArray(chat.followUpAnswers)) {
            chat.followUpAnswers = [];
          }
          
          const aiResponse = await GeminiService.interpretTarot(
            chat.topic.name,
            chat.question,
            chat.cards,
            chat.followUpQuestions,
            chat.followUpAnswers,
            user
          );

          await this.createMessage(chatID, null, 'ai', aiResponse, false);
          return aiResponse;
        }

        // Còn câu tiếp theo
        const nextQuestion = chat.followUpQuestions[chat.currentFollowUpIndex];
        await chat.save();
        await this.createMessage(chatID, null, 'ai', nextQuestion, false);
        return nextQuestion;
      }

      // 3. Đã interpret → user hỏi tiếp
      if (chat.stage === 'interpreted') {
        const chatHistory = await this.getMessages(chatID);
        const aiResponse = await GeminiService.getFollowUpResponse(chatHistory.data, userMessage);
        await this.createMessage(chatID, null, 'ai', aiResponse, false);
        return aiResponse;
      }

      return null;
    } catch (error) {
      console.error('❌ Error in getAIResponseAndSave:', error);
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