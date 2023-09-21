const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authcontroller = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const Router = express.Router();


Router.get('/', bookingController.bookingCheckout, authcontroller.isLoggedIn, viewsController.getOverview);
Router.get('/tour/:slug', authcontroller.isLoggedIn, viewsController.getTour);
Router.get('/login', authcontroller.isLoggedIn, viewsController.getlogin);
Router.get('/signup', viewsController.createSignup);
Router.get('/me', authcontroller.protect, viewsController.getAboutme);
Router.get('/my-bookings', authcontroller.protect, viewsController.getBookings)




module.exports = Router;



