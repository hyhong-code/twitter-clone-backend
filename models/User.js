const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'A username is required'],
      trim: true,
      lowercase: true,
      unique: [true, 'A username must be unique'],
      minlength: [5, 'A username must be at least 5 characters long'],
      maxlength: [20, 'A username must be no more than 25 characters long'],
      match: [
        /^[a-z0-9_-]+$/,
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
      required: [true, 'A password confirmation is required'],
      validate: {
        validator: function (v) {
          return v === this.password;
        },
        message: 'Passwords must match',
      },
    },
    pwResetToken: String,
    pwResetTokenExpires: String,
    pwChangedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    followers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    followedBy: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  { toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

// VIRTUAL POPULATE TWEETS
UserSchema.virtual('tweets', {
  ref: 'Tweet',
  localField: '_id',
  foreignField: 'user',
  onlyOne: false,
});

// EXCLUDE DISABLED USERS FROM QUERIES
UserSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

// HASH PASSWORD
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.pwChangedAt = new Date(Date.now() - 5000);
  next();
});

// VERIFY PASSWORD
UserSchema.methods.verifyPassword = async function (plain) {
  return await bcrypt.compare(plain, this.password);
};

// GENERATE JWT TOKEN
UserSchema.methods.genJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

module.exports = mongoose.model('User', UserSchema);
