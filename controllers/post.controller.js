const Post = require('../models/post.model');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

const handlerFactory = require('./handlerFactory');
const commentConroller = require('./comment.controller');
const Comment = require('../models/comment.model');
const AppError = require('../utils/appError');
const Like = require('../models/like.model');

exports.getAllPosts = handlerFactory.getAll(Post);
exports.getPost = handlerFactory.getOne(Post);

exports.createPost = handlerFactory.createOne(Post);
exports.updatePost = handlerFactory.updateOne(Post, [
  'title',
  'status',
  'categories',
  'content'
]);
exports.deletePost = handlerFactory.deleteOne(Post);

exports.deletePostCascade = catchAsync(async (req, res, next) => {
  const doc = await Post.findByPk(req.params.id);
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  if (!req.user || (req.user.role !== 'admin' && req.user.id !== doc.author)) {
    console.log('current User', req.user);
    return next(
      new AppError('You are not allowed to perform this action', 403)
    );
  }

  const comments = await Comment.findAll({
    where: {
      entity_id: doc.id,
      entity: 'post'
    }
  });

  comments.forEach(element => {
    commentConroller.deleteCommentRecursive(element);
  });

  await Like.destroy({
    where: {
      entity_id: doc.id,
      entity: 'post'
    }
  });
  await doc.destroy();

  await res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getCurrentUserPosts = catchAsync(async (req, res, next) => {
  const selectOptions = new ApiFeatures(req.query)
    .filter()
    .limitFields()
    .sort()
    .paginage()
    .getOptions();

  const docs = await Post.findAllPopulated({
    conditions: { ...selectOptions.conditions, author: req.user.id },
    fields: selectOptions.fields,
    sort: selectOptions.sort,
    paginage: selectOptions.paginate
  });

  // console.log(docs);
  await res.status(200).json({
    status: 'success',
    docs
  });
});
