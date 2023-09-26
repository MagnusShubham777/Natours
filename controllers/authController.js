const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const catchAsync = require('./../utils/catchAsyncerror');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const { promisify } = require('util');

const sendcreatedToken = async (user, statuscode, res) => {
    const token = await tokenSign(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true

    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions, {
        sameSite: 'Lax', // You can use 'Lax' or 'Strict' as well
        secure: true,
    })
    user.password = undefined;
    res.status(statuscode).json({
        status: "success",
        token,
        data: {
            user
        }

    })
}

const tokenSign = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

exports.signup = catchAsync(async (req, res, next) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    //console.log(url);
    //await new Email(newUser, url).sendWelcome();

    sendcreatedToken(newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //if password and email exist
    if (!email || !password) {
        return next(new AppError("Email or password does not exist", 400));
    }


    //check if user exist and password is correct

    const user = await User.findOne({ email }).select('+password');

    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError("Incorrect mail or password", 401));
    }


    //IF everything OK ,send respose back to client

    sendcreatedToken(user, 200, res);

});

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
}

exports.protect = catchAsync(async (req, res, next) => {
    let token
    //getting token and check if its there

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        //console.log(req.cookies);
        token = req.cookies.jwt;
    }


    if (!token) {
        return next(new AppError("User is not logged in.Please log in", 401));
    }

    //Verification of tokens

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //console.log(decoded);

    //check if user still exist after verification done

    const CurrentUser = await User.findById(decoded.id);

    if (!CurrentUser) {
        return next(new AppError("User belonging to this token does no longer exist", 401));
    }

    //check if password changed after token assigned

    if (CurrentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError("User Password changed again.Please log in again", 401));
    }


    //Grant access to protected routes
    req.user = CurrentUser;
    res.locals.user = CurrentUser;
    next();

});

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            //Verification of token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            //check if user still exist after verification done

            const CurrentUser = await User.findById(decoded.id);

            if (!CurrentUser) {
                return next();
            }

            //check if password changed after token assigned

            if (CurrentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            //Grant access to user
            res.locals.user = CurrentUser;
            return next();

        } catch (err) {
            return next();
        }
    }
    next();

}

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You dont have permission for this action", 403));
        }
        next();
    }
}

exports.forgetPassword = catchAsync(async (req, res, next) => {
    //1) get user data from post request


    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError("There is no user with email address", 404));
    }
    //console.log(user);

    //2)generate a web token

    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });


    //3)Send email to reset password

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;

    try {
        await new Email(user, resetURL).resetPassword();
        res.status(200).json({
            status: 'success',
            message: 'token sent to email'
        })
    } catch (err) {
        user.passwordResetToken = undefined,
            user.passwordResetExpire = undefined
        await user.save({ validateBeforeSave: false });

        return next(new AppError('there was an error sending the mail.Try again later!!', 500));


    }



});

exports.resetPassword = catchAsync(async (req, res, next) => {

    //1)Get user based on token

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpire: { $gt: Date.now() } });

    //2) If user not found or token has expired

    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    //3)Set new password

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    //3)Update changedPasswordAt property for the user

    //4)Log the user in and send JWT

    sendcreatedToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {

    //1)get user from collection

    const user = await User.findById(req.user.id).select('+password');
    //console.log(user);

    //2)check if posted password is correct or not


    if (!await (user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError("Your current password is wrong", 401));
    }

    //3)if password is correct update password

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4)send the response back

    sendcreatedToken(user, 200, res);
    // res.redirect('/');
    // sendcreatedToken(user, 200, res);


});


