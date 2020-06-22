const asyncHandler = require('../utils/asyncHandler');
const CustomError = require('../utils/customError');
const Tweet = require('../models/Tweet');
const filterBody = require('../utils/filterBody');
const QueryOptions = require('../utils/queryOptions');

// @desc    Create a tweet
// @route   POST /api/v1/tweets
// @access  Private - "user", "admin"
exports.createTweet = asyncHandler(async (req, res, next) => {
  req.body.user = req.user._id;

  const tweet = await Tweet.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { tweet },
  });
});

// @desc    Get all tweets
// @route   GET /api/v1/tweets
// @access  Public
exports.getTweets = asyncHandler(async (req, res, next) => {
  const query = Tweet.find();

  const tweets = await new QueryOptions(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate().query;

  res.status(200).json({
    status: 'success',
    results: tweets.length,
    data: { tweets },
  });
});

// @desc    Update a tweet
// @route   PATCH /api/v1/tweets/:id
// @access  Private - "user(owner)", "admin"
exports.updateTweet = asyncHandler(async (req, res, next) => {
  let tweet = await Tweet.findById(req.params.id);

  // HANDLE TWEET DOES NOT EXIST
  if (!tweet) {
    return next(new CustomError(`No such tweet with id ${req.params.id}`, 404));
  }

  // HANDLE TWEET DOES NOT BELONG TO USER
  if (tweet.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new CustomError(`User not authorized to access this route`, 401)
    );
  }

  // UPDATE TWEET
  const filteredBody = filterBody(req.body, 'text', 'hashtag');
  tweet = await Tweet.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { tweet },
  });
});

// @desc    Update a tweet
// @route   PATCH /api/v1/tweets/:id
// @access  Private - "user(owner)", "admin"
exports.deleteTweets = asyncHandler(async (req, res, next) => {
  const tweet = await Tweet.findById(req.params.id);

  // HANDLE TWEET DOES NOT EXIST
  if (!tweet) {
    return next(new CustomError(`No such tweet with id ${req.params.id}`, 404));
  }

  // HANDLE TWEET DOES NOT BELONG TO USER
  if (tweet.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new CustomError(`User not authorized to access this route`, 401)
    );
  }

  // DELETE TWEET
  await tweet.remove();
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
