const mongoose = require('mongoose');

const TweetSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'text field is required'],
    trim: true,
    minlength: [5, 'A tweet must be at least 5 characters long'],
    maxlength: [280, 'A tweet must be no more than 280 characters long'],
  },
  hashtag: {
    type: [
      {
        type: String,
        trim: true,
        maxlength: [16, 'A hashtag must be no more than 15 characters long'],
        match: [
          /^#[a-zA-Z0-9]+$/,
          'A hashtag must start with a "#" and only contain a-z and 0-9',
        ],
      },
    ],
    validate: {
      validator: (v) => v.length <= 5,
      message: 'A tweet can have at most 5 hashtags',
    },
    default: [],
  },
  image: String,
  location: {
    type: {
      type: String,
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  likes: {
    type: Number,
    default: 0,
  },
  location: {
    type: [Number],
    validate: {
      validator: (v) => v.length === 2,
      message: 'location must be in the format of [lng, lat]',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Tweet', TweetSchema);
