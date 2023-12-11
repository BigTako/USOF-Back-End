const express = require('express');
const likeController = require('./../controllers/like.controller');
const authController = require('./../controllers/auth.controller');
const router = express.Router();

router.get('/post/:id', likeController.getEntityLikes('post'));
router.get('/comment/:id', likeController.getEntityLikes('comment'));

router.use(authController.protect);

router.post('/', likeController.createLike);

router.use(authController.restrictTo('admin'));

router.get('/', likeController.getAllLikes);

router
  .route('/:id')
  .get(likeController.getLike)
  .patch(likeController.updateLike)
  .delete(likeController.deleteLike);

module.exports = router;
