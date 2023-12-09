const express = require('express');
const postController = require('./../controllers/post.controller');
const authController = require('./../controllers/auth.controller');
const router = express.Router();

router.get('/', postController.getAllPosts);

router.post('/', postController.createPost);

// query to get current user posts here
router.get('/me', authController.protect, postController.getCurrentUserPosts);

router
  .route('/:id')
  .get(postController.getPost)
  .patch(postController.updatePost)
  .delete(postController.deletePost);

module.exports = router;
