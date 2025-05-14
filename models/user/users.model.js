const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { validateMinLength } = require('../../utils/ValidateModel');

const userSchema = new Schema({
  id: {
    type: String,
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
  },
  status: {
    type: Boolean,
    required: true,
    default: true
  },
}, { timestamps: true, discriminatorKey: 'role' });

module.exports = mongoose.model('User', userSchema);