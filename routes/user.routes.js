const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

router.use(authController.protect);

router
  .route('/')
  .get(authController.restrictTo('admin'), userController.getAllUsers)
  .post(
    authController.restrictTo('admin'),
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.catchProfilePicture,
    userController.createUser
  );

router
  .route('/me')
  .get(userController.getMe)
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.catchProfilePicture,
    userController.updateMe
  )
  .delete(userController.deleteMe);

router.get('/me/rating', userController.getRating);

router.route('/updatePassword').patch(userController.updatePassword);

router
  .route('/:id')
  .get(authController.restrictTo('admin'), userController.getUser)
  .patch(
    authController.restrictTo('admin'),
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.catchProfilePicture,
    userController.updateUser
  )
  .delete(authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;
