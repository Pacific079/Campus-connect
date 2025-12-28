require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');

const userRoute = require('./routes/user');
const courseRoute = require('./routes/course');
const studentRoute = require('./routes/student');
const feeRoute = require('./routes/fee');
const clubRoute = require('./routes/club');
const eventRoute = require('./routes/event');
const syllabusRoute = require('./routes/syllabus');
const roomsRoute = require('./routes/rooms');

//   *************    Data Base connect     *************

mongoose
    .connect(process.env.MONGOOSE_URL)
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch((error) => {
        console.log('Database connection failed', error);
    });

app.use(bodyParser.json());
app.use(cors())

// Configure file upload with proper temp directory handling
const tempDir = process.platform === 'win32' ?
    path.join(process.env.TEMP || 'C:\\temp', 'campus-connect') :
    '/tmp/campus-connect';

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: tempDir,
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
        safeFileNames: true,
        preserveExtension: true,
    })
);

app.use('/user', userRoute);
app.use('/course', courseRoute);
app.use('/student', studentRoute);
app.use('/fee', feeRoute);
app.use('/club', clubRoute);
app.use('/event', eventRoute);
app.use('/syllabus', syllabusRoute);
app.use('/rooms', roomsRoute);

app.use('*', (req, res) => {
    res.status(404).json({
        msg: 'bad router request',
    });
});

module.exports = app;