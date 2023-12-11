const { Sequelize } = require('../models');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const handlerFactory = require('./handlerFactory');

exports.getAllComments = handlerFactory.getAll(Comment);
exports.getComment = handlerFactory.getOne(Comment);

exports.createComment = handlerFactory.createOne(Comment);

exports.updateComment = handlerFactory.updateOne(Comment, ['status']);
exports.deleteComment = handlerFactory.deleteOne(Comment);

// exports.getEntityComments = handlerFactory.getEntityData(Comment);
exports.getPostComments = catchAsync(async (req, res, next) => {
  const selectOptions = new ApiFeatures(req.query)
    .filter()
    .limitFields()
    .sort()
    .paginage()
    .getOptions();

  const docs = await Comment.findAllPopulated(
    {
      ...selectOptions.conditions,
      entity: 'post',
      entity_id: req.params.id
    },
    selectOptions.fields,
    selectOptions.sort,
    selectOptions.paginate
  );

  // console.log(docs);
  await res.status(200).json({
    status: 'success',
    docs
  });
});

exports.getCommentComments = catchAsync(async (req, res, next) => {
  const selectOptions = new ApiFeatures(req.query)
    .filter()
    .limitFields()
    .sort()
    .paginage()
    .getOptions();

  const docs = await Comment.findAllPopulated(
    {
      ...selectOptions.conditions,
      entity: 'comment',
      entity_id: req.params.id
    },
    selectOptions.fields,
    selectOptions.sort,
    selectOptions.paginate
  );

  // console.log(docs);
  await res.status(200).json({
    status: 'success',
    docs
  });
});
