const mongoose = reqire('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'A username is required'],
    trim: true,
    lowercase: true,
    unique: [true, 'A username must be unique'],
    minlength: [5, 'A username must be at least 5 characters long'],
    maxlength: [20, 'A username must be no more than 25 characters long'],
    match: [
      /^[a-z0-9_-]$/gim,
      'A username must only contain a-z, 0-9, "-", and "-"',
    ],
  },
  email: {
    type: String,
    required: [true, 'An email is required'],
    trim: true,
    lowercase: true,
    unique: [true, 'An email must be unique'],
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Please provide a valid email address',
    },
  },
  role: {
    type: String,
    default: 'user',
    enum: {
      values: ['user', 'admin'],
      message: 'A user must be either user or admin',
    },
  },
  profilePhoto: String,
  password: {
    type: String,
    required: [true, 'A password is required'],
    minlength: [6, 'A password must be at least 6 characters long'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A password is required'],
    validate: {
      validator: function (v) {
        return v === this.password;
      },
      message: 'Passwords must match',
    },
  },
  pwResetToken: String,
  pwResetTokenExpires: String,
  pwResetAt: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('User', UserSchema);
