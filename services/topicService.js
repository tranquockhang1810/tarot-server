const Topic = require("../models/topic/topic.model.js");

class TopicService {
  static async findTopic(topicID) {
    try {
      const existTopic = await Topic.findById(topicID);
      return existTopic;
    } catch (error) {
      return null;
    }
  }

  static async getAllTopic() {
    try {
      const topics = await Topic
      .find()
      .select("_id name code image");
      return topics;
    } catch (error) {
      return null
    }
  }
}

module.exports = TopicService;