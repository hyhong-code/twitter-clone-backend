const asyncHandler = require('../utils/asyncHandler');
const CustomError = require('../utils/customError');
const User = require('../models/User');
const QueryOptions = require('../utils/queryOptions');

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
