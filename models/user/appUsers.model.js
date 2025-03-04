const mongoose = require('mongoose');
const { validateBirthDate } = require('../../utils/ValidateModel');
const User = require('./users.model');

const appUserSchema = new mongoose.Schema({
  birthDate: {
    type: Date,
    required: true,
    validate: {
      validator: (birthDate) => validateBirthDate(birthDate),
      message: `Birth date should be in the past.`
    }
  },
  gender: {
    type: String, 
    enum: ["male", "female"],
    required: true
  },
  type: {
    type: String, 
    enum: ["phone", "facebook"],
    required: true
  },
  avatar: {
    type: String,
  },
  point: {
    type: Number,
    required: true,
    default: 0
  }
});

module.exports = User.discriminator('user', appUserSchema);
