const mongoose = require('mongoose');

class MongoDb {
  constructor() {
    if (!MongoDb.instance) {
      MongoDb.instance = this;
      this.connect();
    }
    return MongoDb.instance;
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }
}

const instance = new MongoDb();
Object.freeze(instance);
module.exports = instance;