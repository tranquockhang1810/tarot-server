const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);