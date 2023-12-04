const Post = require('../models/post.model');

const handlerFactory = require('./handlerFactory');

exports.getAllPosts = handlerFactory.getAll(Post);
exports.getPost = handlerFactory.getOne(Post);

exports.createPost = handlerFactory.createOne(Post);
exports.updatePost = handlerFactory.updateOne(Post);
exports.deletePost = handlerFactory.deleteOne(Post);
