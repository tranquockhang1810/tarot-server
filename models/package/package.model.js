const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const packageSchema = new Schema({
  price: {
    type: Number,
    required: true
  },
  point: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);