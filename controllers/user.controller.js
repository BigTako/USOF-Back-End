const { sequelize } = require('../models');
const User = require('../models/user.model');
const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const handlerFactory = require('./handlerFactory');

exports.getAllUsers = handlerFactory.getAll(User);
exports.getUser = handlerFactory.getOne(User);

exports.createUser = handlerFactory.createOne(User);
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findOneActive(req.user.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword',
        400
      )
    );
  }
  const { fullName, email, login } = req.body;
  const user = await User.findOneActive(req.user.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  if (fullName) {
    user.fullName = fullName;
  }
  if (email) {
    user.email = email;
  }
  if (login) {
    user.login = login;
  }
  await user.save();
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;

  const user = await User.findOneActive(req.user.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 401));
  }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findOneActive(req.user.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  user.active = false;
  await user.save();
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getRating = catchAsync(async (req, res, next) => {
  const [results, metadata] = await sequelize.query(`
    SELECT SUM("likesCount")
    FROM (
      SELECT "likesCount", author as id FROM Posts
      UNION ALL
      SELECT "likesCount", author as id FROM comments
      UNION ALL
      SELECT -1 * "dislikesCount", author as id FROM Posts
      UNION ALL
      SELECT -1 * "dislikesCount", author as id FROM comments
    ) AS likes
    WHERE likes.id = ${sequelize.escape(req.params.id)}
  `);

  const rating = results[0].sum;

  res.status(200).json({
    status: 'success',
    data: {
      user: req.params.id,
      rating
    }
  });
});
