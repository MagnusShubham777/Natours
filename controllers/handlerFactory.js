const catchAsync = require('./../utils/catchAsyncerror');
const AppError = require('./../utils/appError');
const APIfeatures = require('./../utils/ApiFeatures');



exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('Doc id not found with that id', 404));
        }
        res.status(204).json({
            status: "Success",
            data: null
        })
    });

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError('document id not found with that id', 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    })

});

exports.createOne = Model => catchAsync(async (req, res, next) => {

    const newdoc = await Model.create(req.body);
    res.status(200).json({
        status: "success",
        data: {
            newdoc
        }

    })
}
);

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {

    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
        return next(new AppError('invalid document id', 404));

    }
    res.status(200).json({
        status: "success",
        data: {
            data: doc
        }
    })
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
    //For nested Routes in Reviews
    let filter = {};
    if (req.params.tourID) filter = { tour: req.params.tourID }
    const features = new APIfeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .feildLimit()
        .paging()
    const doc = await features.query;

    //SEND RESPONSE
    res.status(200).json({
        status: "success",
        results: doc.length,
        data: {
            data: doc
        }
    })

});
