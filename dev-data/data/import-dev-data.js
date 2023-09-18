const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

const fs = require('fs');

dotenv.config({ path: './config.env' });


//Read JSON files
const Tourdata = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const Userdata = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviewdata = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log("DB connection successful!!!")
});


///Import data to DB 

const importData = async () => {
    try {

        await Tour.create(Tourdata);
        await User.create(Userdata, { validateBeforeSave: false });
        await Review.create(reviewdata);
        console.log("Data successfully loaded!!");

    } catch (err) {
        console.log(err);
    }
    process.exit();

}


///Delete Data from DB

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data deletion Successfull!!");

    } catch (err) {
        console.log(err);
    }
    process.exit();
}

console.log(process.argv);

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}




