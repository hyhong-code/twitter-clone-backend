const asyncHandler = require('../utils/asyncHandler');
const CustomError = require('../utils/customError');
const Tweet = require('../models/Tweet');
const Comment = require('../models/Comment');
const QueryOptions = require('../utils/queryOptions');

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
// @route   GET /api/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
  const query = Comment.find();
  const comments = await new QueryOptions(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate().query;

  res.status(200).json({
    status: 'success',
    data: { comments },
  });
});

// @desc    Delete a comment
// @route   DELETE /api/v1/comments/:id
// @access  Public
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  // HANDLE COMMENT NOT FOUND
  if (!comment) {
    return next(
      new CustomError(`No comment found with id ${req.params.id}`, 404)
    );
  }

  // HANDLE USER IS NOT COMMENT OWNER
  if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new CustomError(`User not authorized to access this route`, 401)
    );
  }

  await comment.remove();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
