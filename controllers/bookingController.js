const stripe = require('stripe')('sk_test_51NqvXUSIayE5uQn9bWlIKY4sDyXTSk6UGcZXHNjVMNR1huvx19T9Sj3a2biov4h5UJCB1Fk1jqpmfst68MtbUv5C00Us9dGCfF');
const Tour = require('./../models/tourModel');
const catchAsync = require('../utils/catchAsyncerror');
const AppError = require('./../utils/appError');
const bookingTour = require('./../models/bookingModel');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //1 get currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    //2 create checkout sessions
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: `${tour.name} Tour`,
                    description: tour.summary,
                    images: [
                        `https://www.natours.dev/img/tours/${tour.imageCover}`
                    ],
                },
                unit_amount: tour.price * 100,
            },

            quantity: 1
        }]

    })



    //3 Send it to client
    res.status(200).json({
        status: 'success',
        session
    })


});

exports.bookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;

    if (!tour || !user || !price) return next();
    await bookingTour.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);

});

exports.getAllBookings = factory.getAll(bookingTour);
exports.getBooking = factory.getOne(bookingTour)
exports.createBooking = factory.createOne(bookingTour);
exports.updateBooking = factory.updateOne(bookingTour);
exports.deleteBooking = factory.deleteOne(bookingTour);