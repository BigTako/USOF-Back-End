const Post = require('../models/post.model');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

const handlerFactory = require('./handlerFactory');

exports.getAllPosts = handlerFactory.getAll(Post);
exports.getPost = handlerFactory.getOne(Post);

exports.createPost = handlerFactory.createOne(Post);
exports.updatePost = handlerFactory.updateOne(Post);
exports.deletePost = handlerFactory.deleteOne(Post);

exports.getCurrentUserPosts = catchAsync(async (req, res, next) => {
  const selectOptions = new ApiFeatures(req.query)
    .filter()
    .limitFields()
    .sort()
    .paginage()
    .getOptions();

  const docs = await Post.findAllPopulated(
    { ...selectOptions.conditions, author: req.user.id },
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
