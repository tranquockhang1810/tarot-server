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

const addTopic = async (req, res, next) => {
  try {
    const { name, code, image, price } = req.body;
    if (!name || !code || !image || !price) {
      return next({ status: 400, message: "Missing required fields" });
    }
    const newTopic = await TopicService.addTopic({ name, code, image, price });
    if (!newTopic) {
      return next({ status: 404, message: "Topics not found" });
    }
    return res.status(200).json({
      code: 200,
      message: "Topics fetched successfully",
      data: newTopic
    })
  } catch (error) {
    console.error("❌ Error getting topic list:", error);
    next({ status: 500, message: "Internal server error" });
  }
}

module.exports = {
  getTopicList,
  addTopic
}