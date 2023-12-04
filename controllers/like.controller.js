const Like = require('../models/like.model');
const catchAsync = require('../utils/catchAsync');

const handlerFactory = require('./handlerFactory');

exports.getAllLikes = handlerFactory.getAll(Like);
exports.getLike = handlerFactory.getOne(Like);

exports.createLike = catchAsync(async (req, res, next) => {
  let [like] = await Like.findAllPopulated({
    author: req.body.author,
    entity_id: req.body.entity_id,
    entity: req.body.entity
  });

  if (like) {
    if (like.type !== req.body.type) {
      console.log('im here');
      await Like.update(req.body, { where: { id: like.id } });
      like.type = req.body.type;
    } else {
      await Like.destroy({ where: { id: like.id } });
    }
  } else {
    console.log(req.body);
    like = await Like.create(req.body);
  }

  await res.status(201).json({
    status: 'success',
    data: like
  });
});

exports.updateLike = handlerFactory.updateOne(Like);
exports.deleteLike = handlerFactory.deleteOne(Like);

exports.getEntityLikes = handlerFactory.getEntityData(Like);
