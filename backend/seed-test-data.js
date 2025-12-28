const mongoose = require('mongoose');
const ExamRoom = require('./model/ExamRoom');
const User = require('./model/User');
const Student = require('./model/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function seedTestData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/campus_connect');
        console.log('Connected to MongoDB');

        // Create test rooms
        const rooms = [
            { name: 'Exam Hall A', rows: 5, cols: 6, capacity: 30, building: 'Main Building', floor: 1, isActive: true },
            { name: 'Exam Hall B', rows: 4, cols: 8, capacity: 32, building: 'Main Building', floor: 2, isActive: true },
            { name: 'Exam Hall C', rows: 6, cols: 5, capacity: 30, building: 'Annex Building', floor: 1, isActive: true }
        ];

        for (const roomData of rooms) {
            const existingRoom = await ExamRoom.findOne({ name: roomData.name });
            if (!existingRoom) {
                const room = new ExamRoom(roomData);
                await room.save();
                console.log(`Created room: ${roomData.name}`);
            } else {
                console.log(`Room already exists: ${roomData.name}`);
            }
        }

        // Create test approved user
        const testUserData = {
            instituteName: 'Test Institute',
            phone: '1234567890',
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'student',
            imageUrl: 'https://via.placeholder.com/150',
            imageId: 'test_image',
            isApproved: true
        };

        let testUser = await User.findOne({ email: testUserData.email });
        if (!testUser) {
            testUser = new User(testUserData);
            await testUser.save();
            console.log('Created test user');
        } else {
            console.log('Test user already exists');
        }

        // Create test students
        const students = [
            { fullName: 'John Doe', phone: '1111111111', address: 'Address 1', email: 'john@test.com', courseId: 'course1', uId: testUser._id },
            { fullName: 'Jane Smith', phone: '2222222222', address: 'Address 2', email: 'jane@test.com', courseId: 'course1', uId: testUser._id },
            { fullName: 'Bob Johnson', phone: '3333333333', address: 'Address 3', email: 'bob@test.com', courseId: 'course1', uId: testUser._id },
            { fullName: 'Alice Brown', phone: '4444444444', address: 'Address 4', email: 'alice@test.com', courseId: 'course1', uId: testUser._id },
            { fullName: 'Charlie Wilson', phone: '5555555555', address: 'Address 5', email: 'charlie@test.com', courseId: 'course1', uId: testUser._id },
            { fullName: 'Diana Davis', phone: '6666666666', address: 'Address 6', email: 'diana@test.com', courseId: 'course1', uId: testUser._id },
            { fullName: 'Edward Miller', phone: '7777777777', address: 'Address 7', email: 'edward@test.com', courseId: 'course1', uId: testUser._id },
            { fullName: 'Fiona Garcia', phone: '8888888888', address: 'Address 8', email: 'fiona@test.com', courseId: 'course1', uId: testUser._id }
        ];

        for (const studentData of students) {
            const existingStudent = await Student.findOne({ email: studentData.email });
            if (!existingStudent) {
                const student = new Student({
                    ...studentData,
                    _id: new mongoose.Types.ObjectId(),
                    imageUrl: 'https://via.placeholder.com/150',
                    imageId: 'student_image'
                });
                await student.save();
                console.log(`Created student: ${studentData.fullName}`);
            } else {
                console.log(`Student already exists: ${studentData.fullName}`);
            }
        }

        console.log('Test data seeding completed!');
        console.log('Created 3 rooms and 8 approved students');

    } catch (error) {
        console.error('Error seeding test data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seedTestData();