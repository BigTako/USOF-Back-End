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

exports.getEntityComments = handlerFactory.getEntityData(Comment);
