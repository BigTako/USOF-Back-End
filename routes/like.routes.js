const express = require('express');
const likeController = require('./../controllers/like.controller');
const authController = require('./../controllers/auth.controller');
const router = express.Router();

router.get('/:id/likes', likeController.getEntityLikes);

router.use(authController.protect);

router.post('/', likeController.createLike);

router.use(authController.restrictTo('admin'));

router.get('/', likeController.getAllLikes);

router
  .route('/:id')
  .get(likeController.getLike)
  .patch(likeController.updateLike)
  .delete(likeController.deleteLike);
// router.get('/', userController.getAllUsers);

module.exports = router;
