const asyncHandler = require('../utils/asyncHandler');
const CustomError = require('../utils/customError');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const filterBody = require('../utils/filterBody');

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

// @desc    Load logged in user
// @route   GET /api/v1/auth/loadme
// @access  Private - "user", "admin"
exports.loadMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// @desc    Update logged in user username & email
// @route   PATCH /api/v1/auth/updateinfo
// @access  Private - "user", "admin"
exports.updateInfo = asyncHandler(async (req, res, next) => {
  const filteredBody = filterBody(req.body, 'username', 'email');
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// @desc    Update logged in user password
// @route   PATCH /api/v1/auth/updatepassword
// @access  Private - "user", "admin"
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;

  // HANDLE REQUIRED FIELDS MISSING
  if (!(currentPassword && password && passwordConfirm)) {
    return next(
      new CustomError(
        `Fields currentPassword, password, and passwordConfirm are required`,
        400
      )
    );
  }

  // HANDLE PASSWORD INCORRECT
  let user = await User.findById(req.user.id).select('+password');
  if (!(await user.verifyPassword(currentPassword))) {
    return next(new CustomError(`Password incorrect`, 401));
  }

  // CHANGE PASSWORD AND SEND NEW TOKEN
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user = await user.save({ validateBeforeSave: true });

  signAndSendJwt(user, 200, res);
});

// @desc    Delete logged in user
// @route   DELETE /api/v1/auth/deleteme
// @access  Private - "user", "admin"
exports.deleteMe = asyncHandler(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;

  // HANDLE REQUIRED FIELDS MISSING
  if (!req.body.currentPassword) {
    return next(new CustomError(`Fields currentPassword is required`, 400));
  }

  // HANDLE PASSWORD INCORRECT
  let user = await User.findById(req.user.id).select('+password');
  if (!(await user.verifyPassword(currentPassword))) {
    return next(new CustomError(`Password incorrect`, 400));
  }

  // DISABLE USER
  req.user.isActive = false;
  await req.user.save({ validateBeforeSave: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// AUTHENTICATE USER WITH TOKEN
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // HANDLE BEARER TOKEN
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];

    // HANLE COOKIE TOKEN
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // NO TOKEN
  if (!token) {
    return next(new CustomError(`No token found, plase login`, 401));
  }

  let decoded;

  // HANDLE TEMPERED TOKEN
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(new CustomError('Invalid token, please login again', 401));
  }

  // HANDLE USER DELETED
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new CustomError(`User not found`, 404));
  }

  // HANDLE USER PASSWORD CHANGED
  if (user.pwChangedAt.getTime() / 1000 > decoded.iat) {
    return next(
      new CustomError(`User password recently changed, please login again`, 401)
    );
  }

  // ATTACH USER TO REQUEST
  req.user = user;
  next();
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

// AUTHORIZE USER BY ROLES
exports.authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  });
