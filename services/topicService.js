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
      .select("_id name code image price");
      return topics;
    } catch (error) {
      return null
    }
  }

  static async addTopic(data) {
    try {
      const newTopic = new Topic(data);
      await newTopic.save();
      return newTopic;
    } catch (error) {
      return null
    }
  }
}

module.exports = TopicService;