const express = require('express');
const router = express.Router();
require('dotenv').config();
const checkAuth = require('../middleware/checkAuth');
const Student = require('../model/Student');
const User = require('../model/User');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

//*****      add Student     ************** */

router.post('/add-student', checkAuth, async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verify = jwt.verify(token, 'ism patna');
        console.log(req.body);
        console.log(req.files.image);

        const img = await cloudinary.uploader.upload(req.files.image.tempFilePath);

        const newStudent = new Student({
            _id: new mongoose.Types.ObjectId(),
            fullName: req.body.fullName,
            phone: req.body.phone,
            email: req.body.email,
            address: req.body.address,
            imageUrl: img.secure_url,
            imageId: img.public_id,
            uId: verify.uId,
            courseId: req.body.courseId,
        });
        try {
            const studentAdded = await newStudent.save();
            res.status(200).json({
                newStudent: studentAdded,
            });
        } catch (err) {
            res.status(500).json({
                reeor: err || 'Not Save Student',
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'Image not Upload',
        });
    }
});

//   **********    Get all student   *************

router.get('/all-student', checkAuth, async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verify = jwt.verify(token, 'ism patna');

        const findAllStudent = await Student.find({ uId: verify.uId }).select(
            '_id uId fullName phone address email courseId imageUrl imageId'
        );
        console.log(findAllStudent);

        return res.status(200).json({
            getAllstudent: findAllStudent,
        });
    } catch (err) {
        return res.status(500).json({
            error: err || 'Server Error',
        });
    }
});

// **********  DIAGNOSTIC ENDPOINT - Check database contents  ******************

router.get('/debug-data', checkAuth, async(req, res) => {
    try {
        console.log('\n=== DEBUG ENDPOINT: Checking database contents ===\n');

        // Check students
        const allStudents = await Student.find({}).select('_id uId fullName email').lean();
        console.log('📚 STUDENTS IN DATABASE:');
        console.log(`   Total: ${allStudents.length}`);
        allStudents.forEach((s, i) => {
            console.log(`   [${i+1}] ${s.fullName} | Email: ${s.email} | uId: ${s.uId}`);
        });

        // Check users
        const allUsers = await User.find({}).select('_id email instituteName isApproved role').lean();
        console.log('\n👥 ALL USERS IN DATABASE:');
        console.log(`   Total: ${allUsers.length}`);
        allUsers.forEach((u, i) => {
            console.log(`   [${i+1}] ${u.email} | isApproved: ${u.isApproved} | role: ${u.role}`);
        });

        // Check approved users specifically
        const approvedUsers = await User.find({ isApproved: true }).select('_id email').lean();
        console.log('\n✅ APPROVED USERS:');
        console.log(`   Total: ${approvedUsers.length}`);
        approvedUsers.forEach((u, i) => {
            console.log(`   [${i+1}] ${u.email} | ID: ${u._id}`);
        });

        return res.status(200).json({
            studentsCount: allStudents.length,
            students: allStudents,
            usersCount: allUsers.length,
            users: allUsers,
            approvedUsersCount: approvedUsers.length,
            approvedUsers: approvedUsers
        });
    } catch (err) {
        console.error('Error in debug endpoint:', err);
        return res.status(500).json({ error: err.message });
    }
});

// **********         get all approved students for seating manager        ****************

router.get('/check-student-tables', checkAuth, async(req, res) => {
    try {
        console.log('\n=== Checking both Student tables ===');

        // Check Student table
        const studentCount = await Student.countDocuments();
        const allFromStudent = await Student.find({}).select('fullName email').lean();
        console.log(`Student table: ${studentCount} records`);
        allFromStudent.forEach(s => console.log(`  - ${s.fullName} (${s.email})`));

        // Check StudentProfile table (if it exists)
        try {
            const StudentProfile = require('../model/StudentProfile');
            const profileCount = await StudentProfile.countDocuments();
            const allFromProfile = await StudentProfile.find({}).select('fullName email').lean();
            console.log(`StudentProfile table: ${profileCount} records`);
            allFromProfile.forEach(s => console.log(`  - ${s.fullName} (${s.email})`));
        } catch (err) {
            console.log('StudentProfile table: Not found or error');
        }

        return res.status(200).json({
            studentTable: { count: studentCount, records: allFromStudent },
            message: 'Check console logs for StudentProfile data'
        });
    } catch (err) {
        console.error('Error checking tables:', err);
        return res.status(500).json({ error: err.message });
    }
});

router.get('/approved-students', checkAuth, async(req, res) => {
    try {
        console.log('\n=== /approved-students endpoint called ===');

        // StudentProfile is the authoritative student table with User references
        const StudentProfile = require('../model/StudentProfile');

        // Fetch all student profiles with populated User data for email
        let allStudents = await StudentProfile.find({})
            .populate({
                path: 'userId',
                select: 'email isApproved'
            })
            .select('_id userId fullName phone address courseId batch enrollmentNo rollNumber')
            .sort({ rollNumber: 1, enrollmentNo: 1 }) // Sort by rollNumber first, then enrollmentNo
            .lean();

        console.log(`Found ${allStudents.length} total students from StudentProfile`);

        // Map to include email from populated User
        allStudents = allStudents.map(student => ({
            _id: student._id,
            uId: student.userId?._id || student.userId,
            fullName: student.fullName,
            email: student.userId?.email || 'N/A',
            phone: student.phone,
            address: student.address,
            courseId: student.courseId,
            batch: student.batch,
            enrollmentNo: student.enrollmentNo,
            rollNumber: student.rollNumber,
            isApproved: student.userId?.isApproved || false
        }));

        allStudents.forEach((s, idx) => {
            console.log(`  [${idx + 1}] ${s.fullName} (${s.email}) - Approved: ${s.isApproved}`);
        });

        return res.status(200).json({
            getAllstudent: allStudents,
            totalStudents: allStudents.length,
            approvedCount: allStudents.length,
            note: 'All students returned in registration order from StudentProfile'
        });
    } catch (err) {
        console.error('❌ ERROR in /approved-students endpoint:', err);

        // Fallback to Student table if StudentProfile fails
        try {
            console.log('Falling back to Student table...');
            const fallbackStudents = await Student.find({})
                .select('_id uId fullName phone address email courseId imageUrl imageId')
                .sort({ _id: 1 })
                .lean();

            console.log(`Fallback: Found ${fallbackStudents.length} students from Student table`);
            return res.status(200).json({
                getAllstudent: fallbackStudents,
                totalStudents: fallbackStudents.length,
                approvedCount: fallbackStudents.length,
                note: 'Using fallback Student table'
            });
        } catch (fallbackErr) {
            console.error('❌ Fallback also failed:', fallbackErr);
            return res.status(500).json({
                error: err.message || 'Server Error',
            });
        }
    }
});

// **********         get all student for a particular corse        ****************

router.get('/all-student/:courseId', checkAuth, async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verify = jwt.verify(token, 'ism patna');

        const allStudent = await Student.find({
            uId: verify.uId,
            courseId: req.params.courseId,
        }).select('_id uId fullName phone address email courseId imageUrl imageId');
        if (allStudent == 0) {
            return res.status(400).json({
                message: 'No Course Available',
            });
        } else {
            return res.status(200).json({
                getAllstudent: allStudent,
            });
        }
    } catch (err) {
        return res.status(400).json({
            message: 'server error student not found',
        });
    }
});

// *******     delete a Student     **************

router.delete('/:id', checkAuth, async(req, res) => {
    const token = rea - headers.authorization.split(' ')[1];
    const verify = jwt.verify(token, 'ism patna');

    try {
        const deleteStudent = await Student.findById(req.params.id);
        console.log('delete Student', deleteStudent);

        if (deleteStudent.uId === verify.uId) {
            const deletedStudent = await Student.finstByIdAndDelete(req.params.id);
            await cloudinary.uploader.destroy(deleteStudent.imageId, (deleteimg) => {
                res.status(200).json({
                    deletedStudent: deletedStudent,
                });
            });
        } else {
            res.status(400).json({
                error: 'student not delete',
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err,
        });
    }
});

// ***********    Update student  ***************

router.put('/:id', checkAuth, async(req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const verify = jwt.verify(token, 'ism patna');

    try {
        const findUpdateStudent = await Student.findById(req.params.id);
        if (findUpdateStudent.uId != verify.uId) {
            return res.status(500).json({
                msg: 'you are not eligible update Student.',
            });
        }
        if (req.files) {
            await cloudinary.uploader.destroy(
                findUpdateStudent.imageId,
                (deleteimg) => {
                    cloudinary.uploader.upload(req.files.image.tempFilePath),
                        (err, img) => {
                            const newUpdateStudent = {
                                fullName: req.body.fullName,
                                phone: req.body.phone,
                                email: req.body.email,
                                address: req.body.address,
                                image: img.secure_url,
                                imageId: img.public_id,
                                useId: verify.uId,
                                courseId: req.body.courseId,
                            };
                            try {
                                Student.findByIdAndUpdate(req.params.id, newUpdateStudent, {
                                        new: true,
                                    })
                                    .then((updatedStudent) => {
                                        res.status(200).json({
                                            newStudent: updatedStudent,
                                        });
                                    })
                                    .catch((err) => {
                                        res.status(500).json({
                                            error: err,
                                        });
                                    });
                            } catch (err) {
                                return res.status(400).json({
                                    error: 'not update Stusent',
                                });
                            }
                        };
                }
            );
        } else {
            const updateStudent = {
                fullName: req.body.fullName,
                phone: req.body.phone,
                email: req.body.email,
                address: req.body.address,
                imageUrl: findUpdateStudent.imageUrl,
                imageId: findUpdateStudent.imageId,
                uId: verify.uId,
                courseId: req.body.courseId,
            };
            try {
                const updatedStudent = await Student.findByIdAndUpdate(
                    req.params.id,
                    updateStudent, { new: true }
                );
                return res.status(200).json({
                    newUpdatedStudent: updatedStudent,
                });
            } catch (err) {
                console.log(err);

                return res.status(500).json({
                    error: 'Not update try again',
                });
            }
        }
    } catch (err) {
        return res.status(500).json({
            error: 'not authorize',
        });
    }
});

// ***********     Get latest five student      *****************

router.get('/latest-student', checkAuth, async(req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const verify = jwt.verify(token, 'ism patna');

    try {
        await Student.find({ uId: verify.uId })
            .sort({ $natural: -1 })
            .limit(5)
            .then((latestStudent) => {
                return res.status(200).json({
                    Lateststudent: latestStudent,
                });
            });
    } catch (err) {
        return res.status(500).json({
            error: err,
        });
    }
});

// Public register route (no auth) - useful for signup from external forms
router.post('/register-student', async(req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        const img = await cloudinary.uploader.upload(req.files.image.tempFilePath);

        const fullName = req.body.fullName || `${req.body.firstName || ''} ${req.body.middleName || ''} ${req.body.lastName || ''}`.replace(/\s+/g, ' ').trim();

        const newStudent = new Student({
            _id: new mongoose.Types.ObjectId(),
            fullName: fullName || 'Unnamed Student',
            phone: req.body.phone || req.body.contact || '',
            email: req.body.email || '',
            address: req.body.address || req.body.streetAddress || '',
            imageUrl: img.secure_url,
            imageId: img.public_id,
            uId: req.body.uId || 'public',
            courseId: req.body.courseId || req.body.course || '',
        });

        const studentAdded = await newStudent.save();
        return res.status(200).json({ newStudent: studentAdded });
    } catch (err) {
        console.error('register-student error', err);
        const errMsg = err && (err.message || (err.error && err.error.message) || JSON.stringify(err)) || 'Server error registering student';
        return res.status(500).json({ error: errMsg });
    }
});

module.exports = router;

// Debug endpoint to check Cloudinary env and server time
router.get('/debug/cloudinary', (req, res) => {
    try {
        const info = {
            cloud_name_present: !!process.env.CLOUD_NAME,
            api_key_present: !!process.env.API_KEY,
            api_secret_present: !!process.env.API_SECRET,
            server_time: Date.now(),
            server_time_iso: new Date().toISOString(),
        };
        return res.status(200).json({ ok: true, info });
    } catch (err) {
        return res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
    }
});

// Get exams registered by the logged-in student
router.get('/registered-exams', checkAuth, async(req, res) => {
    try {
        const payload = req.user;
        if (!payload || !payload.uId) return res.status(400).json({ error: 'invalid token payload' });
        const userId = payload.uId;
        const exams = await RegisteredExam.find({ userId }).select('examCode examName date time venue centerCode').lean();
        return res.status(200).json({ exams });
    } catch (err) {
        console.error('registered-exams error', err);
        return res.status(500).json({ error: 'failed to load registered exams' });
    }
});

// Register an exam for the logged-in student (useful for testing)
router.post('/register-exam', checkAuth, async(req, res) => {
    try {
        const payload = req.user;
        if (!payload || !payload.uId) return res.status(400).json({ error: 'invalid token payload' });
        const userId = payload.uId;
        const { examCode, examName, date, time, venue, centerCode } = req.body;
        if (!examCode || !examName) return res.status(400).json({ error: 'examCode and examName required' });
        const newExam = await RegisteredExam.create({ userId, examCode, examName, date, time, venue, centerCode });
        return res.status(200).json({ exam: newExam });
    } catch (err) {
        console.error('register-exam error', err);
        return res.status(500).json({ error: 'failed to register exam' });
    }
});