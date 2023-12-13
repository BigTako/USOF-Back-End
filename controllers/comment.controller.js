const Comment = require('../models/comment.model');
const Like = require('../models/like.model');
const Post = require('../models/post.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const handlerFactory = require('./handlerFactory');

exports.getAllComments = handlerFactory.getAll(Comment);
exports.getComment = handlerFactory.getOne(Comment);

exports.createComment = catchAsync(async (req, res, next) => {
  req.body.author = req.user.id;

  const model = req.body.entity === 'post' ? Post : Comment;
  const entity = await model.findByPk(req.body.entity_id);

  const body = { ...req.body, author: req.user.id };
  const doc = await Comment.create(body);

  entity.increment('commentsCount');

  await res.status(201).json({
    status: 'success',
    doc
  });
});

exports.updateComment = handlerFactory.updateOne(Comment, ['status']);
// exports.deleteComment = handlerFactory.deleteOne(Comment);

exports.deleteCommentRecursive = async comment => {
  const replies = await Comment.findAll({
    where: {
      entity_id: comment.id,
      entity: 'comment'
    },
    attributes: ['id', 'entity_id', 'entity']
  });

  replies.forEach(doc => {
    this.deleteCommentRecursive(doc);
  });

  await Like.destroy({
    where: {
      entity_id: comment.id,
      entity: 'comment'
    }
  });
  await comment.destroy();
};

exports.deleteComment = catchAsync(async (req, res, next) => {
  const doc = await Comment.findByPk(req.params.id);
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  if (
    !req.user ||
    (req.user.role !== 'admin' && req.user.id !== doc.authorId)
  ) {
    return next(
      new AppError('You are not allowed to perform this action', 403)
    );
  }

  if (doc.entity === 'post') {
    const post = await Post.findByPk(doc.entity_id);
    post.decrement('commentsCount');
  }

  this.deleteCommentRecursive(doc);

  await res.status(204).json({
    status: 'success',
    data: {}
  });
});

exports.getEntityComments = entityName =>
  handlerFactory.getEntityData(Comment, entityName);
