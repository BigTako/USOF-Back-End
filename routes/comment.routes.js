const express = require('express');
const commentController = require('./../controllers/comment.controller');
const authController = require('./../controllers/auth.controller');
const router = express.Router();

// router
//   .route('/')
//   .get(commentController.getAllComments)
//   .post(commentController.createComment);

// router
//   .route('/:id')
//   .get(commentController.getComment)
//   .patch(commentController.updateComment)
//   .delete(commentController.deleteComment);

router.get('/post/:id', commentController.getPostComments);
router.get('/comment/:id', commentController.getCommentComments);

router.use(authController.protect);

router.get('/', commentController.getAllComments);

router.post('/', commentController.createComment);

router
  .route('/:id')
  .get(commentController.getComment)
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment);

module.exports = router;
