const Comment = require('../models/comment.model');
const Like = require('../models/like.model');
const Post = require('../models/post.model');
const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const handlerFactory = require('./handlerFactory');

exports.getAllLikes = handlerFactory.getAll(Like);
exports.getLike = handlerFactory.getOne(Like);

exports.createLike = catchAsync(async (req, res, next) => {
  let [like] = await Like.findAllPopulated({
    author: req.user.id,
    entity_id: req.body.entity_id,
    entity: req.body.entity
  });

  req.body.author = req.user.id;
  const model = req.body.entity === 'post' ? Post : Comment;
  const entity = await model.findByPk(req.body.entity_id);

  if (like) {
    if (like.type !== req.body.type) {
      // like and dislike
      await Like.update(req.body, { where: { id: like.id } });
      if (req.body.type === 'like') {
        entity.increment('likesCount');
        entity.decrement('dislikesCount');
      } else if (req.body.type === 'dislike') {
        entity.increment('dislikesCount');
        entity.decrement('likesCount');
      }
    } else {
      await Like.destroy({ where: { id: like.id } });
      if (req.body.type === 'like') {
        entity.decrement('likesCount');
      } else if (req.body.type === 'dislike') {
        entity.decrement('dislikesCount');
      }
    }
  } else {
    like = await Like.create(req.body);
    if (req.body.type === 'like') {
      entity.increment('likesCount');
    } else if (req.body.type === 'dislike') {
      entity.increment('dislikesCount');
    }
  }

  await res.status(201).json({
    status: 'success',
    data: like
  });
});

exports.updateLike = handlerFactory.updateOne(Like);
exports.deleteLike = handlerFactory.deleteOne(Like);

exports.getEntityLikes = handlerFactory.getEntityData(Like);

exports.getPostLikes = catchAsync(async (req, res, next) => {
  const selectOptions = new ApiFeatures(req.query)
    .filter()
    .limitFields()
    .sort()
    .paginage()
    .getOptions();

  const docs = await Like.findAllPopulated(
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

exports.getCommentLikes = catchAsync(async (req, res, next) => {
  const selectOptions = new ApiFeatures(req.query)
    .filter()
    .limitFields()
    .sort()
    .paginage()
    .getOptions();

  const docs = await Like.findAllPopulated(
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
