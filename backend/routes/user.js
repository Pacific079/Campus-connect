const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/checkAuth');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//signup

router.post('/signup', (req, res) => {
  User.find({ email: req.body.email }).then((users) => {
    {
      if (users.length > 0) {
        return res.status(500).json({
          error: 'email already registered',
        });
      }

      cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        (err, result) => {
          if (!err) {
            console.log('File details', result);

            bcrypt.hash(req.body.password, 10, (err, hash) => {
              if (err) {
                return res.status.apply(500).json({
                  error: err,
                });
              }
              const newUser = new User({
                _id: new mongoose.Types.ObjectId(),
                instituteName: req.body.instituteName,
                phone: req.body.phone,
                email: req.body.email,
                password: hash,
                role: req.body.role || 'student',
                imageUrl: result.secure_url,
                imageId: result.public_id,
                isApproved: req.body.role === 'student' ? false : true,
              });
              newUser
                .save()
                .then(async (resultUser) => {
                  try {
                    // create role specific profile
                    const role = resultUser.role || 'student';
                    if (role === 'student') {
                      const StudentProfile = require('../model/StudentProfile');
                      await StudentProfile.create({
                        userId: resultUser._id,
                        fullName: req.body.fullName || req.body.instituteName || '',
                        phone: req.body.phone || '',
                        address: req.body.address || '',
                        courseId: req.body.courseId || '',
                        batch: req.body.batch || '',
                        enrollmentNo: req.body.enrollmentNo || '',
                        rollNumber: req.body.rollNumber || '',
                        dob: req.body.dob || '',
                      });
                    } else if (role === 'admin') {
                      const AdminProfile = require('../model/AdminProfile');
                      await AdminProfile.create({ userId: resultUser._id, instituteName: req.body.instituteName || '', phone: req.body.phone || '', department: req.body.department || '', address: req.body.address || '' });
                    } else if (role === 'seating_manager') {
                      const SeatingManagerProfile = require('../model/SeatingManagerProfile');
                      await SeatingManagerProfile.create({ userId: resultUser._id, phone: req.body.phone || '', department: req.body.department || '', roomsManaged: req.body.roomsManaged ? (req.body.roomsManaged + '').split(',').map(s => s.trim()) : [], shift: req.body.shift || '' });
                    } else if (role === 'club_coordinator') {
                      const ClubCoordinatorProfile = require('../model/ClubCoordinatorProfile');
                      await ClubCoordinatorProfile.create({ userId: resultUser._id, phone: req.body.phone || '', clubName: req.body.clubName || '', clubEmail: req.body.clubEmail || '', clubDescription: req.body.clubDescription || '' });
                    }
                  } catch (profileErr) {
                    console.error('profile creation error', profileErr);
                  }

                  res.status(200).json({ NewUser: resultUser });
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({ error: err });
                });
            });
          } else {
            return res.status(400).json({ error: 'Image upload failed' });
          }
        }
      );
    }
  });
});

//**************     LOGIN Router  *********** */

router.post('/login', (req, res) => {
  User.find({ email: req.body.email}) // user.find return a array of email
    .then((user) => {
      if (user == 0) {
        return res.status(400).json({
          msg: 'email not registred..',
        });
      }
      
      

      bcrypt.compare(req.body.password, user[0].password, (err, password) => {
        if (err) {
          
          return res.status(500).json({
            error: 'Server Error comparing password',
          });
        }
        if (!password) {
          return res.status(400).json({
            error: 'invalid password',
          });
        }
        if (!user[0].isApproved) {
          return res.status(403).json({
            error: 'Your account is pending admin approval. Please wait for approval to login.',
          });
        }

        const token = jwt.sign(
          {
            email: user[0].email,
            instituteName: user[0].instituteName,
            phone: user[0].phone,
            uId: user[0]._id,
            role: user[0].role || 'student'
          },
          'ism patna',
          {
            expiresIn: '10d',
          }
        );
        return res.status(200).json({
          _id: user[0]._id,
          instituteName: user[0].instituteName,
          phone: user[0].phone,
          email: user[0].email,
          role: user[0].role || 'student',
          imageUrl: user[0].imageUrl,
          imageId: user[0].imageId,
          token: token,
        });
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Server error.' });
    });
});

module.exports = router;

// Protected route to get current user's profile (role-specific)
router.get('/profile', checkAuth, async (req, res) => {
  try {
    const payload = req.user; // set by checkAuth
    if (!payload || !payload.uId) return res.status(400).json({ error: 'invalid token payload' });
    const role = payload.role || 'student';
    const userId = payload.uId;

    // load role-specific profile
    if (role === 'student') {
      const StudentProfile = require('../model/StudentProfile');
      const profile = await StudentProfile.findOne({ userId: userId }).lean();
      return res.status(200).json({ role, profile });
    }
    if (role === 'admin') {
      const AdminProfile = require('../model/AdminProfile');
      const profile = await AdminProfile.findOne({ userId: userId }).lean();
      return res.status(200).json({ role, profile });
    }
    if (role === 'seating_manager') {
      const SeatingManagerProfile = require('../model/SeatingManagerProfile');
      const profile = await SeatingManagerProfile.findOne({ userId: userId }).lean();
      return res.status(200).json({ role, profile });
    }
    if (role === 'club_coordinator') {
      const ClubCoordinatorProfile = require('../model/ClubCoordinatorProfile');
      const profile = await ClubCoordinatorProfile.findOne({ userId: userId }).lean();
      return res.status(200).json({ role, profile });
    }

    return res.status(200).json({ role, profile: null });
  } catch (err) {
    console.error('profile error', err);
    return res.status(500).json({ error: 'failed to load profile' });
  }
});

// Get pending approvals (admin only)
router.get('/pending-approvals', checkAuth, async (req, res) => {
  try {
    const payload = req.user;
    if (!payload || payload.role !== 'admin') {
      return res.status(403).json({ error: 'only admin can view pending approvals' });
    }
    const pendingUsers = await User.find({ isApproved: false }).select('_id email instituteName phone role createdAt').lean();
    return res.status(200).json({ pendingUsers });
  } catch (err) {
    console.error('pending-approvals error', err);
    return res.status(500).json({ error: 'failed to load pending approvals' });
  }
});

// Approve a user (admin only)
router.post('/approve/:userId', checkAuth, async (req, res) => {
  try {
    const payload = req.user;
    if (!payload || payload.role !== 'admin') {
      return res.status(403).json({ error: 'only admin can approve users' });
    }
    const userId = req.params.userId;
    const approvedUser = await User.findByIdAndUpdate(userId, { isApproved: true }, { new: true }).select('_id email instituteName role isApproved');
    if (!approvedUser) return res.status(404).json({ error: 'user not found' });
    return res.status(200).json({ message: 'user approved', user: approvedUser });
  } catch (err) {
    console.error('approve error', err);
    return res.status(500).json({ error: 'failed to approve user' });
  }
});

// Reject a user (delete unapproved account) (admin only)
router.delete('/reject/:userId', checkAuth, async (req, res) => {
  try {
    const payload = req.user;
    if (!payload || payload.role !== 'admin') {
      return res.status(403).json({ error: 'only admin can reject users' });
    }
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'user not found' });
    // destroy image from Cloudinary if exists
    if (user.imageId) {
      await cloudinary.uploader.destroy(user.imageId).catch(e => console.warn('cloudinary destroy failed', e));
    }
    // delete user and associated profile
    await User.findByIdAndDelete(userId);
    // try to delete role-specific profile (best effort)
    const role = user.role || 'student';
    if (role === 'student') {
      const StudentProfile = require('../model/StudentProfile');
      await StudentProfile.deleteOne({ userId }).catch(e => console.warn('profile delete failed', e));
    }
    return res.status(200).json({ message: 'user rejected and deleted' });
  } catch (err) {
    console.error('reject error', err);
    return res.status(500).json({ error: 'failed to reject user' });
  }
});
