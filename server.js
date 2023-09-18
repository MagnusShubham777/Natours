process.on("uncaughtException", err => {
    console.log(err.name, err.message);
    console.log("UNCAUGHT EXCEPTION Shutting Down");
    process.exit(1);
})

const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("DB connection successful!!!");
    })

const port = 3000;
const address = '127.0.0.1';

const server = app.listen(port, address, () => {
    console.log(`App running on port ${port}...`)
})


process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log("UNHANDLER REJECTION Shutting Down");
    server.close(() => {
        process.exit(1);
    })

})