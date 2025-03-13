const ChatService = require("../services/chatService");
const TopicService = require("../services/topicService");
const MessageService = require("../services/messageService");

const createChat = async (req, res, next) => {
  try {
    const { topic, question, cards } = req.body;
    const user = req.user.id;

    if (!user) return next({ status: 400, message: "User ID is missing from token" });
    if (!topic) return next({ status: 400, message: "Missing topic" });
    if (!question) return next({ status: 400, message: "Missing question" });
    if (!cards || cards?.length !== 3) return next({ status: 400, message: "Must have exactly 3 cards" });

    //Check valid topic
    const existTopic = await TopicService.findTopic(topic);
    if (!existTopic) return next({ status: 400, message: "Topic not found" });

    const chat = await ChatService.createChat({ user, topic, question, cards });
    return res.status(200).json({
      code: 200,
      message: "Chat created successfully",
      data: {
        ...chat._doc,
        __v: undefined,
      }
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
}

const getChats = async (req, res, next) => {
  try {
    const user = req.user.id;
    const { status, topic, fromDate, toDate } = req.query;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;

    if (!user) return next({ status: 400, message: "User ID is missing from token" });

    // ✅ Validate status (true | false | undefined)
    if (status !== undefined && status !== "true" && status !== "false") {
      return next({ status: 400, message: "Status must be 'true' or 'false'" });
    }
    const statusFilter = status !== undefined ? status === "true" : undefined;

    // ✅ Validate topic (Mảng ID hợp lệ)
    let topicFilter;
    if (topic) {
      const topicArray = Array.isArray(topic) ? topic : [topic];
      const validTopics = await Promise.all(topicArray.map(async (id) => TopicService.findTopic(id)));
      const filteredTopics = topicArray.filter((_, index) => validTopics[index]);

      if (filteredTopics.length === 0) return next({ status: 400, message: "Invalid topic IDs" });
      topicFilter = filteredTopics;
    }

    // ✅ Validate fromDate & toDate
    if (fromDate && isNaN(new Date(fromDate).getTime())) {
      return next({ status: 400, message: "Invalid fromDate format" });
    }
    if (toDate && isNaN(new Date(toDate).getTime())) {
      return next({ status: 400, message: "Invalid toDate format" });
    }
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      return next({ status: 400, message: "fromDate must be less than or equal to toDate" });
    }

    // ✅ Validate page & limit
    if (isNaN(page) || page < 1) {
      return next({ status: 400, message: "Page must be a positive number" });
    }
    if (isNaN(limit) || limit < 1) {
      return next({ status: 400, message: "Limit must be a positive number" });
    }

    // 🔍 Gọi Service để xử lý truy vấn
    const chats = await ChatService.getChats({
      id: user,
      status: statusFilter,
      topic: topicFilter,
      fromDate,
      toDate,
      page,
      limit
    });

    return res.status(200).json({
      code: 200,
      message: "Chats fetched successfully",
      data: chats?.chats || [],
      paging: chats?.paging
    });

  } catch (error) {
    next({ status: 500, message: error?.message });
  }
};

const getChat = async (req, res, next) => {
  try {
    const { id } = req.query;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;

    if (!id) return next({ status: 400, message: "Missing chat ID" });

    // ✅ Validate page & limit
    if (isNaN(page) || page < 1) {
      return next({ status: 400, message: "Page must be a positive number" });
    }
    if (isNaN(limit) || limit < 1) {
      return next({ status: 400, message: "Limit must be a positive number" });
    }

    const chat = await MessageService.getMessages(id, page, limit);

    if (!chat) return next({ status: 404, message: "Chat not found" });


    return res.status(200).json({
      code: 200,
      message: "Chat fetched successfully",
      data: chat?.data,
      paging: chat?.paging
    });
  } catch (error) {
    next({ status: 500, message: error?.message });
  }
}

module.exports = {
  createChat,
  getChats,
  getChat
};