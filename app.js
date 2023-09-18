
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieparser = require('cookie-parser');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const appError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongosanitize = require('express-mongo-sanitize');


//Start express Code
const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

////////GLOBAL MIDDLEWARE//////////////
//Set security HTTP headers
app.use(helmet());

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "https://js.stripe.com"],
                frameSrc: ["'self'", "https://js.stripe.com"],
                connectSrc: ["'self'", "ws://127.0.0.1:62004"],
            },
        },
    })
);


//development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


//body parser,to read req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieparser());

//test headers
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    //console.log(req.cookies);
    next();
})


//Data sanitization against Nosql injection
app.use(mongosanitize());

//Data sanitization against XSS
app.use(xss());




//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//limit request to same API
const limiter = rateLimit({
    max: 100,
    windowMS: 60 * 60 * 1000,
    message: "Too many request fro this IP.Please try again in an hour"

})
app.use('/api', limiter);

//3)Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter)


//HANDLE INVALID ROUTE
app.all('*', (req, res, next) => {

    // res.status(200).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server`
    // })

    // const err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.statusCode = 404;
    // err.status = 'fail';
    next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
})




//GLOBAL ERROR HANDLING MIDDLEWARE
app.use(errorController);




module.exports = app



