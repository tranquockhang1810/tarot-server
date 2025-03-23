const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const topicSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String
  },
  image: {
    type: String
  },
  price: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema);