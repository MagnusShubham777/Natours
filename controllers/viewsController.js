const Tour = require("../models/tourModel");
const AppError = require("../utils/appError");
const catchAsyncerror = require("../utils/catchAsyncerror");
const Booking = require("../models/bookingModel");

exports.getOverview = catchAsyncerror(async (req, res, next) => {
    //1)get Tours data from collection
    const tours = await Tour.find();

    //2) Build template
    //3)Render the data

    res.status(200).render('overview', {
        title: "All tours",
        tours
    })
});

exports.getTour = catchAsyncerror(async (req, res, next) => {

    //1)get data of Tour from URL
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: "review rating user"
    });
    if (!tour) {
        return next(new AppError("Tour id not found with that name", 404));
    }
    res.status(200).render('tour', {
        title: `${tour.name} tour`,
        tour

    })

});

exports.getlogin = (req, res) => {

    res.status(200).render('login', {
        title: 'Log in account'
    });

}

exports.getAboutme = (req, res) => {
    res.status(200).render('aboutme', {
        title: 'Your account'
    })

}
exports.createSignup = (req, res) => {
    res.status(200).render('signup', {
        title: 'Sign Up',

    })
}

exports.getBookings = catchAsyncerror(async (req, res, next) => {
    //get all bookings

    const booking = await Booking.find({ user: req.user.id });
    //console.log(booking);

    //Get all tour bookings

    const tourids = booking.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourids } });
    //console.log(tourids);
    res.status(200).render('overview', {
        title: "tours",
        tours
    })
});