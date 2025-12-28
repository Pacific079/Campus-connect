const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const Course = require('../model/Course');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const Student = require('../model/Student');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//************ */            Add course        ***********

router.post('/add-course', checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const verify = jwt.verify(token, 'ism patna');

    const result = await cloudinary.uploader.upload(
      req.files.image.tempFilePath
    );

    const newCourse = new Course({
      _id: new mongoose.Types.ObjectId(),
      courseName: req.body.courseName,
      price: req.body.price,
      description: req.body.description,
      startingDate: req.body.startingDate,
      endDate: req.body.endDate,
      uId: verify.uId,
      imageUrl: result.secure_url,
      imageId: result.public_id,
    });

    const savedCourse = await newCourse.save();
    res.status(200).json({
      newCourse: savedCourse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// ***********      get all courses   ******

router.get('/all-courses', checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const verify = jwt.verify(token, 'ism patna');

    const courses = await Course.find({ uId: verify.uId }).select(
      '_id uId courseName description price startingDate endDate imageUrl imageId'
    );
    res.status(200).json({ allCourses: courses });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

//*******     get one Course for any user    ****************** */

router.get('/course-details/:id', checkAuth, async (req, res) => {
  try {
    // const token = req.headers.authencation.split(" ")[1]
    // const verify = jwt.verify(token, 'ism patna');

    const singleCourse = await Course.findById(req.params.id).select(
      '_id uId courseName description price startingDate endDate imageUrl imageId'
    );
    await Student.find({ courseId: req.params.id }).then((students) => {
      if (students == 0) {
        res.status(200).json({
          singleCourse,
          studentsList: 'not added Student',
        });
      } else {
        res.status(200).json({
          singleCourse,
          studentList: students,
        });
      }
    });
  } catch (err) {
    res.status(500).json({
      err: 'Internal Server Error',
    });
  }
});

//************    delete course         ******************** */

router.delete('/:id', checkAuth, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const verify = jwt.verify(token, 'ism patna');
  try {
    const findDeleteCourse = await Course.findById(req.params.id);
    console.log('find course', findDeleteCourse);

    if (findDeleteCourse.uId === verify.uId) {
      try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.id);
        await cloudinary.uploader.destroy(
          findDeleteCourse.imageId,
          (deletedImg) => {
            res.status(200).json({
              deleteCourse: deletedCourse,
            });
          }
        );
      } catch (err) {
        res.status(500).json({
          msg: 'course not deleted',
        });
      }
    } else {
      res.status(400).json({
        msg: 'Bad request not verify delete course',
      });
    }
  } catch (err) {
    res.status(500).json({
      err: err.message || 'delete course not find',
    });
  }
});

// **********   Update Course       ****************

router.put('/:id', checkAuth, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const verify = jwt.verify(token, 'ism patna');

  try {
    const findUpdateCourse = await Course.findById(req.params.id);
    if (findUpdateCourse.uId != verify.uId) {
      return res.status(500).json({
        msg: 'you are not eligible update Course.',
      });
    }
    if (req.files) {
      await cloudinary.uploader.destroy(
        findUpdateCourse.imageId,
        (deletedImg) => {
          cloudinary.uploader.upload(
            req.files.image.tempFilePath,
            (err, img) => {
              const newUpdatedCourse = {
                courseName: req.body.courseName,
                price: req.body.price,
                description: req.body.description,
                startingDate: req.body.startingDate,
                endDate: req.body.endDate,
                uId: verify.uId,
                imageUrl: img.secure_url,
                imageId: img.public_id,
              };

              Course.findByIdAndUpdate(req.params.id, newUpdatedCourse, {
                new: true,
              })
                .then((updatedData) => {
                  return res.status(200).json({
                    updatedCourse: updatedData,
                  });
                })
                .catch((err) => {
                  console.log(err);
                  return res.status(500).json({
                    err: err,
                  });
                });
            }
          );
        }
      );
    } else {
      const updatedData = {
        courseName: req.body.courseName,
        price: req.body.price,
        description: req.body.description,
        startingDate: req.body.startingDate,
        endDate: req.body.endDate,
        uId: verify.uId,
        imageUrl: findUpdateCourse.imageUrl,
        imageId: findUpdateCourse.imageId,
      };
      try {
        const responseData = await Course.findByIdAndUpdate(
          req.params.id,
          updatedData,
          { new: true }
        );
        res.status(200).json({
          updatedData: responseData,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          msg: err || 'not update data',
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      msg: 'not find Update Course',
    });
  }
});

// ***************     Latest Five Course added         *****************

router.get('/latest-course', checkAuth, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const verify = jwt.verify(token, 'ism patna');

  try {
    await Course.find({ uId: verify.uId })
      .sort({ $natural: -1 })
      .limit(5)
      .then((latestCourse) => {
        return res.status(200).json({
          latestCourse: latestCourse,
        });
      });
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
});

module.exports = router;
