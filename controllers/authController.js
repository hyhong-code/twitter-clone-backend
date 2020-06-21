const asyncHandler = require('../utils/asyncHandler');
const CustomError = require('../utils/customError');
const User = require('../models/User');

// @desc    Sign up a user
// @route   POST /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;

  const user = await User.create({
    username,
    email,
    password,
    passwordConfirm,
  });

  signAndSendJwt(user, 201, res);
});

// @desc    Log in user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  // No user found
  if (!user) {
    return next(new CustomError(`No user found with email ${email}`, 404));
  }

  // Password incorrect
  if (!(await user.verifyPassword(password))) {
    return next(new CustomError(`Invalid credentials`, 401));
  }

  signAndSendJwt(user, 200, res);
});

// SIGN A JWT AND SEND BACK TO CLIENT VIA JSON / COOKIE
const signAndSendJwt = (user, statusCode, res) => {
  const token = user.genJwtToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.status(statusCode).cookie('jwt', token, cookieOptions).json({
    status: 'success',
    data: { token },
  });
};
