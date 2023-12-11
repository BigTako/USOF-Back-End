const Comment = require('../models/comment.model');

const handlerFactory = require('./handlerFactory');

exports.getAllComments = handlerFactory.getAll(Comment);
exports.getComment = handlerFactory.getOne(Comment);

exports.createComment = handlerFactory.createOne(Comment);

exports.updateComment = handlerFactory.updateOne(Comment, ['status']);
exports.deleteComment = handlerFactory.deleteOne(Comment);

exports.getEntityComments = entityName =>
  handlerFactory.getEntityData(Comment, entityName);
