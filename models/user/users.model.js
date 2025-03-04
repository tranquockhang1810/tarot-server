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
    required: true,
    validate: {
      validator: (phone) => validateMinLength(phone, 12) && phone.length === 12,
      message: `Phone should be exactly 10 characters.`
    },
    unique: true
  },
  status: {
    type: Boolean,
    required: true,
    default: true
  },
}, { timestamps: true, discriminatorKey: 'role' });

module.exports = mongoose.model('User', userSchema);