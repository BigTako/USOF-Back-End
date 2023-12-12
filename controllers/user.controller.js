const { sequelize } = require('../models');
const User = require('../models/user.model');
const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const sharp = require('sharp');

const handlerFactory = require('./handlerFactory');
const multerStorage = multer.memoryStorage(); // image will be stored as a buffer

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// set filter to filter not image type files
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true); // OK case
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false); // NOT OK case
  }
};

//if multer option dest is not set, image will be saved to memory, not to the disk
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('profilePicture');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  console.log(req.file);
  if (!req.file) return next();

  const userId = req.user?.id || req.body.id || getRandomInt(1, 1000);

  req.file.filename = `user-${userId}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer) // image will be accessible by req.file.buffer if multer storage is set to memory
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 }) // 90% (compress)
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

exports.catchProfilePicture = catchAsync(async function(req, res, next) {
  if (req.file) {
    req.body.profilePicture = `http://127.0.0.1:3000/img/users/${req?.file?.filename}`;
  }
  next();
});

exports.getAllUsers = handlerFactory.getAll(User);
exports.getUser = handlerFactory.getOne(User);
exports.deleteUser = handlerFactory.deleteOne(User);
exports.createUser = handlerFactory.createOne(User);
exports.updateUser = handlerFactory.updateOne(User, [
  'profilePicture',
  'fullName',
  'login',
  'email',
  'role'
]);

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findOneActive(req.user.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: user
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
  const doc = await User.findByPk(req.user.id);

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  await doc.update(req.body);
  await res.status(200).json({
    status: 'success',
    doc
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;

  const user = await User.findOne({ where: { id: req.user.id, active: true } });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  if (!(await User.correctPassword(passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 401));
  }
  user.password = await bcrypt.hash(password, 12);
  user.passwordConfirm = '';
  await user.save();

  res.status(200).json({
    status: 'success',
    data: user
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
    data: rating
  });
});
