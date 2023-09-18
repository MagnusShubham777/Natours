const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {

    let message = `Invalid ${err.path}:${err.value}`;
    return new AppError(message, 404);


}

const handleDuplicateKeyDB = (err) => {
    const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    console.log(value);
    return new AppError(`Duplicate key found for ${value},Please try with another name`, 400);
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input:${errors.join('. ')}`;
    return new AppError(message, 400);

}

const handleInvalidToken = (err) => {
    return new AppError("Invalid token,please log in again!", 401);
}

const sendErrorDev = (err, req, res) => {
    //API error
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack

        })
    }

    //Rendered Website
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message

    })
}

const sendErrorprod = (err, req, res) => {
    //API error
    if (req.originalUrl.startsWith('/api')) {
        //Operatinal error
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                msg: err.message

            })
        }

        //Programming error
        else {
            //log error

            console.error('Error!!!', err);


            //send response
            return res.status(500).json({
                status: 'error',
                message: 'Something went wrong'
            })
        }
    }

    //Rendered Website
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            status: err.status,
            message: err.message

        })
    }
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
    })
}



module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;
        error.name = err.name;
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateKeyDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleInvalidToken(error);

        sendErrorprod(error, req, res);
    }
}


