const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please tell us your name']
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Email invaid']
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'guide', 'lead-guide'],
            default: 'user'

        },
        photo: {
            type: String,
            default: 'default.jpg'
        },
        password: {
            type: String,
            required: [true, 'Please provide password'],
            minlength: 8,
            select: false
        },
        passwordConfirm: {
            type: String,
            required: [true, 'Please confirm your password'],

            //THIS ONLY WORKS ON SAVE OR CREATE!!!

            validate: {
                validator: function (el) {
                    return el === this.password;
                },
                message: "Password are not same!!"
            }
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpire: Date,
        active: {
            type: Boolean,
            select: false

        }
    }
);



//PASSWORD ENCRYPTION

UserSchema.pre('save', async function (next) {
    //Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    //Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //Delete the password confirm
    this.passwordConfirm = undefined;

    next();
});

UserSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
})

UserSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
})


//INSTANCE METHODS THAT IS AVAILABLE TO ALL DOCUMENTS OF THE MODEL
UserSchema.methods.correctPassword = async function (candidatePassword, UserPassword) {
    return await bcrypt.compare(candidatePassword, UserPassword);
};

UserSchema.methods.changedPasswordAfter = function (JWTtimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);
        return JWTtimestamp < changedTimeStamp;
    }
    return false;

}

UserSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

    //console.log({ resetToken: resetToken, passwordResetToken: this.passwordResetToken });

    return resetToken;

}

const User = mongoose.model('User', UserSchema);

module.exports = User;


