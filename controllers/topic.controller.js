const TopicService = require("../services/topicService");

const getTopicList = async (req, res, next) => {
  try {
    const topics = await TopicService.getAllTopic();
    if (!topics) {
      return next({ status: 404, message: "Topics not found" });
    }
    return res.status(200).json({
      code: 200,
      message: "Topics fetched successfully",
      data: topics
    })
  } catch (error) {
    console.error("❌ Error getting topic list:", error);
    next({ status: 500, message: "Internal server error" });
  }
}

module.exports = {
  getTopicList
}