const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'A text is required'],
    trim: true,
    minlength: [5, 'A comment must be at least 5 characters long'],
    maxlength: [140, 'A comment must be no more than 280 characters long'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  tweet: {
    type: mongoose.Schema.ObjectId,
    ref: 'tweet',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Comment', CommentSchema);
