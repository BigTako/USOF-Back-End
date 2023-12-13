const express = require('express');
const postController = require('./../controllers/post.controller');
const authController = require('./../controllers/auth.controller');
const router = express.Router();

router.get('/', postController.getAllPosts);

router.post('/', authController.protect, postController.createPost);

// query to get current user posts here
router.get('/me', authController.protect, postController.getCurrentUserPosts);

router
  .route('/:id')
  .get(postController.getPost)
  .patch(authController.protect, postController.updatePost)
  .delete(authController.protect, postController.deletePostCascade);

module.exports = router;
