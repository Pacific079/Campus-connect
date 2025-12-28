const express = require('express');
const router = express.Router();
const ExamRoom = require('../model/ExamRoom');
const checkAuth = require('../middleware/checkAuth');
const jwt = require('jsonwebtoken');

// Get all exam rooms
router.get('/all', checkAuth, async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verify = jwt.verify(token, 'ism patna');

        const rooms = await ExamRoom.find({ isActive: true }).select('_id name rows cols capacity building floor');
        console.log('Fetched rooms:', rooms);

        return res.status(200).json({
            success: true,
            rooms: rooms
        });
    } catch (err) {
        console.log('Error fetching rooms:', err);
        return res.status(500).json({
            error: err || 'Server Error',
            success: false
        });
    }
});

// Get rooms for seating manager (filtered by managed rooms if applicable)
router.get('/seating-rooms', checkAuth, async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verify = jwt.verify(token, 'ism patna');

        // For now, return all active rooms. Later we can filter by seating manager's assigned rooms
        const rooms = await ExamRoom.find({ isActive: true })
            .select('_id name rows cols capacity building floor')
            .sort({ name: 1 });

        return res.status(200).json({
            success: true,
            rooms: rooms.map(room => ({
                id: room._id,
                name: room.name,
                rows: room.rows,
                cols: room.cols,
                capacity: room.capacity,
                building: room.building,
                floor: room.floor
            }))
        });
    } catch (err) {
        console.log('Error fetching seating rooms:', err);
        return res.status(500).json({
            error: err || 'Server Error',
            success: false
        });
    }
});

// Add new exam room (admin only)
router.post('/add', checkAuth, async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verify = jwt.verify(token, 'ism patna');

        // Check if user is admin (you might want to add role checking here)
        const newRoom = new ExamRoom({
            name: req.body.name,
            rows: req.body.rows,
            cols: req.body.cols,
            capacity: req.body.capacity || (req.body.rows * req.body.cols),
            building: req.body.building || 'Main Building',
            floor: req.body.floor || 1
        });

        const savedRoom = await newRoom.save();

        res.status(201).json({
            success: true,
            message: 'Exam room added successfully',
            room: savedRoom
        });
    } catch (err) {
        console.log('Error adding room:', err);
        res.status(500).json({
            error: err.message || 'Server Error',
            success: false
        });
    }
});

// Update exam room
router.put('/update/:id', checkAuth, async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verify = jwt.verify(token, 'ism patna');

        const updatedRoom = await ExamRoom.findByIdAndUpdate(
            req.params.id, {
                name: req.body.name,
                rows: req.body.rows,
                cols: req.body.cols,
                capacity: req.body.capacity,
                building: req.body.building,
                floor: req.body.floor
            }, { new: true }
        );

        if (!updatedRoom) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Room updated successfully',
            room: updatedRoom
        });
    } catch (err) {
        console.log('Error updating room:', err);
        res.status(500).json({
            error: err.message || 'Server Error',
            success: false
        });
    }
});

// Add new exam room for seating manager
router.post('/seating-rooms', checkAuth, async(req, res) => {
    try {
        console.log('POST /seating-rooms called');
        console.log('Request body:', req.body);
        console.log('Headers:', req.headers.authorization);

        const token = req.headers.authorization.split(' ')[1];
        const verify = jwt.verify(token, 'ism patna');
        console.log('User role:', verify.role);

        // Check if user is seating-manager
        // TEMPORARILY DISABLED FOR TESTING - REMOVE THIS LINE IN PRODUCTION
        // if (verify.role !== 'seating_manager') {
        //     console.log('Access denied: user is not seating-manager');
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Access denied. Only seating managers can add rooms.'
        //     });
        // }

        const newRoom = new ExamRoom({
            name: req.body.name,
            rows: req.body.rows,
            cols: req.body.cols,
            capacity: req.body.rows * req.body.cols,
            building: req.body.building || 'Main Building',
            floor: req.body.floor || 1,
            isActive: true
        });

        const savedRoom = await newRoom.save();

        res.status(201).json({
            success: true,
            message: 'Exam room added successfully',
            room: savedRoom
        });
    } catch (err) {
        console.log('Error adding room:', err);
        res.status(500).json({
            error: err.message || 'Server Error',
            success: false
        });
    }
});

// Update exam room for seating manager
router.put('/seating-rooms/:id', checkAuth, async(req, res) => {
    try {
        console.log('PUT /seating-rooms/:id called');
        console.log('Request body:', req.body);
        console.log('Params:', req.params);

        const token = req.headers.authorization.split(' ')[1];
        const verify = jwt.verify(token, 'ism patna');
        console.log('User role:', verify.role);

        // Check if user is seating-manager
        // TEMPORARILY DISABLED FOR TESTING - REMOVE THIS LINE IN PRODUCTION
        // if (verify.role !== 'seating_manager') {
        //     console.log('Access denied: user is not seating-manager');
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Access denied. Only seating managers can update rooms.'
        //     });
        // }

        const updatedRoom = await ExamRoom.findByIdAndUpdate(
            req.params.id, {
                name: req.body.name,
                rows: req.body.rows,
                cols: req.body.cols,
                capacity: req.body.rows * req.body.cols,
                building: req.body.building || 'Main Building',
                floor: req.body.floor || 1
            }, { new: true }
        );

        if (!updatedRoom) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Room updated successfully',
            room: updatedRoom
        });
    } catch (err) {
        console.log('Error updating room:', err);
        res.status(500).json({
            error: err.message || 'Server Error',
            success: false
        });
    }
});

// Delete exam room for seating manager
router.delete('/seating-rooms/:id', checkAuth, async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verify = jwt.verify(token, 'ism patna');

        // Check if user is seating-manager
        // TEMPORARILY DISABLED FOR TESTING - REMOVE THIS LINE IN PRODUCTION
        // if (verify.role !== 'seating_manager') {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Access denied. Only seating managers can delete rooms.'
        //     });
        // }

        const deletedRoom = await ExamRoom.findByIdAndUpdate(
            req.params.id, { isActive: false }, { new: true }
        );

        if (!deletedRoom) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Room deactivated successfully'
        });
    } catch (err) {
        console.log('Error deleting room:', err);
        res.status(500).json({
            error: err.message || 'Server Error',
            success: false
        });
    }
});

// Delete/Deactivate exam room
router.delete('/delete/:id', checkAuth, async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const verify = jwt.verify(token, 'ism patna');

        const deletedRoom = await ExamRoom.findByIdAndUpdate(
            req.params.id, { isActive: false }, { new: true }
        );

        if (!deletedRoom) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Room deactivated successfully'
        });
    } catch (err) {
        console.log('Error deleting room:', err);
        res.status(500).json({
            error: err.message || 'Server Error',
            success: false
        });
    }
});

module.exports = router;