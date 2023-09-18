const AppError = require("../utils/appError");
const catchAsyncerror = require("../utils/catchAsyncerror");
const User = require('./../models/userModel');
const factory = require('./handlerFactory');
const sharp = require('sharp');
const multer = require('multer');




// const multerStorage = multer.diskStorage({
//     //file:req.file,cb:call back function same as next()
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// })

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError("Not an image!Please upload only images", 400), false);

    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUploadPhoto = catchAsyncerror(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)

    next();
});

const filterObj = (obj, ...allowedFields) => {
    const newObject = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObject[el] = obj[el];
        }
    })
    return newObject;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsyncerror(async (req, res, next) => {
    //1)Check if post body contians Password

    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("This route is not for Password update!!.Please visit /updateMypassword", 400));
    }

    //2)Filter data based on what we want to change,we only wants to change name and email
    const filteredObject = filterObj(req.body, 'name', 'email');
    if (req.file) filteredObject.photo = req.file.filename

    const Updateuser = await User.findByIdAndUpdate(req.user.id, filteredObject, { new: true, runValidators: true });
    //3)If all ok update user data and send response

    res.status(200).json({
        status: "success",
        data: {
            user: Updateuser
        }

    })
});

exports.deleteMe = catchAsyncerror(async (req, res, next) => {

    await User.findByIdAndUpdate(req.user.id, { new: true, active: false });

    res.status(201).json({
        status: "success",
        data: null
    })

});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
//Do not update password with this
exports.updateUser = factory.updateOne(User);
