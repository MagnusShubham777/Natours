const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const multer = require('multer');





const Router = express.Router();


Router.post('/signup', authController.signup);
Router.post("/login", authController.login);
Router.get('/logout', authController.logout);
Router.post('/forgetpassword', authController.forgetPassword);
Router.patch('/resetpassword/:token', authController.resetPassword);


// All routes after this will require login
Router.use(authController.protect);



Router.patch('/updatemypassword', authController.updatePassword);
Router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUploadPhoto, userController.updateMe);
Router.delete('/deleteMe', userController.deleteMe);
Router.get('/me', userController.getMe, userController.getUser);

//Only admin can access below routes

Router.use(authController.restrictTo('admin'));

Router.route('/')
    .get(userController.getAllUsers)

Router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = Router