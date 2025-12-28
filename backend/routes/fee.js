const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const jwt = require('jsonwebtoken');
const Fee = require('../model/Fee');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

//add fee

router.post('/add-fee', checkAuth, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const verify = jwt.verify(token, 'ism patna');

  try {
    const newFee = new Fee({
      _id: new mongoose.Types.ObjectId(),
      fullName: req.body.fullName,
      phone: req.body.phone,
      courseId: req.body.courseId,
      uId: verify.uId,
      amount: req.body.amount,
      remark: req.body.remark,
    });
    await newFee
      .save()
      .then((fee) => {
        return res.status(200).json({
          fee: fee,
        });
      })
      .catch((err) => {
        return res.status(400).json({
          error: err,
        });
      });
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
});

// **********************         get all fee collection  data for any user        ****************

router.get('/payment-history', checkAuth, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const verify = jwt.verify(token, 'ism patna');

  try {
    await Fee.find({ uId: verify.uId })
      .then((paymentHistory) => {
        return res.status(200).json({
          paymentHistory: paymentHistory,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          error: err,
        });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: '',
    });
  }
});

// gett all payment for any student in a course

router.get('/all-payment', checkAuth, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const verify = jwt.verify(token, 'ism patna');

  try {
    await Fee.find({
      uId: verify.uId,
      courseId: req.query.courseId,
      phone: req.query.phone,
    })
      .then((allPayment) => {
        return res.status(200).json({
          allPayment: allPayment,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          error: err,
        });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: err,
    });
  }
});

module.exports = router;
