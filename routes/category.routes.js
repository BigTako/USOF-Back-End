const express = require('express');
const categoryController = require('./../controllers/category.controller');
const authController = require('./../controllers/auth.controller');
const { route } = require('./user.routes');
const router = express.Router();

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.createCategory
  );

router.use(authController.protect, authController.restrictTo('admin'));

router
  .route('/:id')
  .get(categoryController.getCategory)
  .patch(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
