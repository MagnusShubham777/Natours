const mongoose = require('mongoose');
const validator = require('validator');
const Tour = require('./tourModel');


const reviewSchema = new mongoose.Schema({

    review: {
        type: String,
        required: [true, 'Review cant be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, "Review must belong to a Tour"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "Review must belong to a user"]

    }

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    //this represent query
    this.populate({
        path: "user",
        select: "name photo"

    });
    next();
});

reviewSchema.statics.calcAverageRatings = async function (TourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: TourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }

            }
        }
    ]);
    //console.log(stats);
    if (stats.length > 0) {

        await Tour.findByIdAndUpdate(TourId, {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].nRating
        })
    }
    else {
        await Tour.findByIdAndUpdate(TourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0
        })
    }

};

reviewSchema.pre(/^findOneAnd/, async function (next) {
    //console.log(this); this represents preset query,this.r represents a variable in this query
    this.r = await this.findOne();
    next();

});

reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.tour)
});

reviewSchema.post(/^findOneAnd/, async function () {
    //console.log(this.r.constructor) gives us updated review document
    this.r.constructor.calcAverageRatings(this.r.tour)
});



const Review = mongoose.model('Review', reviewSchema);


module.exports = Review;

