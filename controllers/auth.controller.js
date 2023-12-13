const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const User = require('../models/user.model');
const { promisify } = require('util');
const Email = require('../utils/email');
const { Op } = require('sequelize');

/**
 * Generate JWT token
 * @param {*} id - user id
 * @returns generated JWT token
 */
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

/**
 * Generate JWt token and send it to cookie based on user credentials.
 * @param {*} user object with user data
 * @param {*} res - response object
 * @returns String generated JWT token
 */
const createToken = (user, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  return token;
};

/**
 * Generate JWt token and send it to cookie and as a responce based on user credentials.
 * @param {*} user object with user data
 * @param {*} statusCode - responce status code
 * @param {*} res - response object
 */
exports.createSendToken = (user, statusCode, res) => {
  const token = createToken(user, res);
  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    doc: user
  });
};
/**
 * Limit roles by access to routes
 * @param  {...any} roles give an access to routes to given list of roles
 * @returns Error if role do not have an access
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.signUp = catchAsync(async (req, res, next) => {
  const activationToken = crypto.randomBytes(32).toString('hex');
  console.log(req.body);
  const newUser = await User.create({
    login: req.body.login,
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    accountActivationToken: crypto
      .createHash('sha256')
      .update(activationToken)
      .digest('hex'),
    accountActivationTokenExpires: Date.now() + 12 * 60 * 60 * 1000 // 12 hours
  });

  try {
    const activationURL = `${process.env.HOST}/account-activation/${newUser.accountActivationToken}`;
    await new Email(newUser, activationURL).sendWelcome(
      'Please, activate your accrount via URL below (token expires in 12 hours ).Activation URL:'
    );
    res.status(200).json({
      status: 'success',
      message: 'Success! Activate your account via url in the email.'
    });
  } catch (err) {
    await User.destroy({ where: { id: newUser.id } });
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
  // this.createSendToken(newUser, 201, res);
});

exports.activateAccount = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    where: {
      accountActivationToken: req.params.token,
      accountActivationTokenExpires: { [Op.gt]: Date.now() }
    }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  await user.update(
    {
      accountActivationToken: null,
      accountActivationExpires: null,
      activated: true
    },
    {
      validate: false
    }
  );

  this.createSendToken(user, 200, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return next(new AppError('Specify email and password to login', 404));
  }

  const user = await User.findOne({
    where: { email: req.body.email, activated: true, active: true }
  });

  if (!user) {
    return next(new AppError('User with this email does not exist', 404));
  }

  if (!(await User.correctPassword(req.body.password, user.password))) {
    return next(new AppError('Incorrect login or password', 404));
  }

  this.createSendToken(user, 200, res);
});

/*
BODY
    {
        "email": "email@example.com",
        "password": "{{password}}",
    },
*/
exports.logOut = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
});

/**
 * Checks if user logged in to give an access to routes which require it.
 * Decodes current token and checks if there is user with such credentials.
 *
 */
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token || token === 'loggedout') {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findOne({ where: { id: decoded.id } });
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  if (currentUser.changedPasswordAfter(currentUser, decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  req.user = currentUser;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ where: { email: req.body.email } });

  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  console.log(user);
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email

  // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    const resetURL = `${process.env.HOST}/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset(
      'Reset your password to transfering by this url URL (token expires in 10 ). Reset URL:'
    );

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { [Op.gt]: Date.now() }
    }
  });

  // console.log(Date.now());

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  console.log(req.body);
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validate: false });

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  this.createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {});
