const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const Tourschema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A Tour must have a name'],
            unique: true,
            trim: true,
            minlength: [10, 'A tour name length should be more or eqaul to 10'],
            maxlength: [40, 'A tour name length should be less than or equal to 40'],

        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a durations']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a maxGroupSize']
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'difficulty is either:easy,medium,difficult'
            }
        },


        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1.0, 'A tour rating must be greater than or equal to 1.0'],
            max: [5.0, 'A tour rating must be less than or equal to 5.0'],
            set: val => Math.round(val * 10) / 10
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, 'A Tour must have a price']

        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    return val < this.price;
                },
                message: "Discount price ({VALUE}) should be less than price"
            }
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description']

        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a imageCover']
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            //GeoJSON object
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],//Array of longitude and latitude
            address: String,
            description: String

        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point']
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number

            }

        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            }
        ],
        // reviews: [
        //     {
        //         type: mongoose.Schema.ObjectId,
        //         ref: "Review"
        //     }
        // ]


    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }

);

Tourschema.index({ price: 1, ratingsAverage: -1 });
Tourschema.index({ startLocation: "2dsphere" });


///DOCUMENT MIDDLEWARE 



Tourschema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

//Virtual Populate

Tourschema.virtual("durationWeeks").get(function () {
    return this.duration / 7;
});
Tourschema.virtual('reviews', {
    ref: "Review",
    foreignField: "tour",
    localField: "_id"

});

///QUERY MIDDLEWARE
Tourschema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    next();
});
Tourschema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: "-__v -passwordChangedAt"
    });
    next();
})


///AGGREGRATE MIDDLEWARE


// Tourschema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     next();
// })







const Tour = mongoose.model('Tour', Tourschema);

module.exports = Tour