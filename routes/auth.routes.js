const express = require('express');
const authController = require('./../controllers/auth.controller');
const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.logIn);
router.post('/logout', authController.protect, authController.logOut);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/activation/:token', authController.activateAccount);

module.exports = router;
