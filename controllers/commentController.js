const asyncHandler = require('../utils/asyncHandler');
const CustomError = require('../utils/customError');
const Tweet = require('../models/Tweet');
const Comment = require('../models/Comment');

// @desc    Create a comment
// @route   POST /api/v1/tweets/:tweetId/comments
// @access  Private - "user", "admin"
exports.createComment = asyncHandler(async (req, res, next) => {
  const tweet = await Tweet.findById(req.params.tweetId);

  // HANDLE TWEET DOES NOT EXIST
  if (!tweet) {
    return next(
      new CustomError(`No such tweet with id ${req.params.tweetId}`, 404)
    );
  }

  // CREATE THE COMMENT
  req.body.user = req.user.id;
  req.body.tweet = req.params.tweetId;
  const comment = await Comment.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { comment },
  });
});

// @desc    Get all comments
// @route   GET /api/v1/tweets/:tweetId/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
  const tweet = await Tweet.findById(req.params.tweetId);

  // HANDLE TWEET DOES NOT EXIST
  if (!tweet) {
    return next(
      new CustomError(`No such tweet with id ${req.params.tweetId}`, 404)
    );
  }

  const comments = await Comment.find({ tweet: req.params.tweetId });
  res.status(200).json({
    status: 'success',
    results: comments.length,
    data: { comments },
  });
});
