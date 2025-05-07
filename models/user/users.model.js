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
    validate: {
      validator: (phone) => validateMinLength(phone, 10) && phone.length === 10,
      message: `Phone should be exactly 10 characters.`
    },
  },
  status: {
    type: Boolean,
    required: true,
    default: true
  },
}, { timestamps: true, discriminatorKey: 'role' });

module.exports = mongoose.model('User', userSchema);