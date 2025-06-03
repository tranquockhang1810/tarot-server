const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  cards: [{
    type: String
  }],
  status: {
    type: Boolean,
    default: true
  },
  followUpQuestions: [String],
  followUpAnswers: [String],
  stage: {
    type: String,
    enum: ['initial', 'awaiting_answer', 'interpreted'],
    default: 'initial'
  },
  currentFollowUpIndex: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
