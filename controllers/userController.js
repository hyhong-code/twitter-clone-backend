const asyncHandler = require('../utils/asyncHandler');
const CustomError = require('../utils/customError');
const User = require('../models/User');
const QueryOptions = require('../utils/queryOptions');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private - "admin"
exports.getUsers = asyncHandler(async (req, res, next) => {
  const query = User.find();
  const users = await new QueryOptions(query, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .query.populate({
      path: 'tweets',
      select: 'text -user',
    });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

// @desc    Get a user
// @route   GET /api/v1/user/:id
// @access  Private - "admin"
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  // HANDLE USER NOT EXIST
  if (!user) {
    return next(new CustomError(`No user with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});
