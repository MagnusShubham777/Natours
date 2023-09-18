
const express = require('express');
const toursController = require('./../controllers/tourController');
const authcontroller = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const Router = express.Router();

// Router.param('id', toursController.checkID)


Router.use('/:tourID/reviews', reviewRouter);

Router.route('/top-5-cheap')
    .get(toursController.aliasTopTours, toursController.getAllTours);


Router.route('/tour-stats')
    .get(toursController.getTourStats);
Router.route('/monthlyplan/:year')
    .get(authcontroller.protect, authcontroller.restrictTo('admin', 'lead-guide', 'guide'), toursController.getMonthlyPlan);

Router.route('/tours-within/distance/:distance/center/:latlng/unit/:unit').get(toursController.tourswithin);
Router.route('/distances/:latlng/unit/:unit').get(toursController.getDistances);
Router.route('/')
    .get(toursController.getAllTours)
    .post(authcontroller.protect, authcontroller.restrictTo('admin', 'lead-guide'), toursController.createTour);


Router.route('/:id')
    .get(toursController.getTour)
    .patch(authcontroller.protect, toursController.uploadToursPhotos, toursController.resizePhotos, authcontroller.restrictTo('admin', 'lead-guide'), toursController.updateTour)
    .delete(authcontroller.protect, authcontroller.restrictTo('admin', 'lead-guide'), toursController.deleteTour);

module.exports = Router

