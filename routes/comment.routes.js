const express = require('express');
const commentController = require('./../controllers/comment.controller');
const authController = require('./../controllers/auth.controller');
const router = express.Router();

router.get('/:id/comments', commentController.getEntityComments);

router.use(authController.protect);

router.get('/', commentController.getAllComments);

router.post('/', commentController.createComment);

router
  .route('/:id')
  .get(commentController.getComment)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

module.exports = router;
