const mongoose = require('mongoose');
const { validateMinLength, validateEmail } = require('../../utils/ValidateModel');
const User = require('./users.model');

const adminUserSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
    validate: {
      validator: (password) => validateMinLength(password, 8),
      message: `Password should be more than 8 characters.`
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [
      {
        validator: validateEmail,
        message: props => `${props.value} is not a valid email address!`
      },
    ]
  },
})

module.exports = User.discriminator('admin', adminUserSchema);