const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const Event = require('../model/Event');

// Get all events
router.get('/all', async(req, res) => {
    try {
        const events = await Event.find().select('_id title description date type createdBy createdAt').lean();
        return res.status(200).json({ events });
    } catch (err) {
        console.error('all events error', err);
        return res.status(500).json({ error: 'failed to load events' });
    }
});

// Get events by type
router.get('/type/:type', async(req, res) => {
    try {
        const type = req.params.type;
        const validTypes = ['exam', 'holiday', 'event', 'deadline'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: 'invalid event type' });
        }
        const events = await Event.find({ type }).select('_id title description date type createdAt').lean();
        return res.status(200).json({ events });
    } catch (err) {
        console.error('events by type error', err);
        return res.status(500).json({ error: 'failed to load events' });
    }
});

// Create an event (admin or club coordinator only)
router.post('/create', checkAuth, async(req, res) => {
    try {
        const payload = req.user;
        if (!payload || (payload.role !== 'admin' && payload.role !== 'club_coordinator')) {
            return res.status(403).json({ error: 'only admin or club coordinator can create events' });
        }
        const { title, description, date, type } = req.body;
        if (!title || !date || !type) {
            return res.status(400).json({ error: 'title, date, and type required' });
        }
        const validTypes = ['exam', 'holiday', 'event', 'deadline'];
        const lowerType = type.toLowerCase();
        if (!validTypes.includes(lowerType)) {
            return res.status(400).json({ error: 'invalid event type' });
        }
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ error: 'invalid date format' });
        }

        const newEvent = await Event.create({
            title,
            description,
            date: parsedDate,
            type: lowerType,
            createdBy: payload.uId,
        });
        return res.status(200).json({ event: newEvent });
    } catch (err) {
        console.error('create event error', err);
        return res.status(500).json({ error: 'failed to create event' });
    }
});

// Update an event (admin or club coordinator only)
router.put('/update/:eventId', checkAuth, async(req, res) => {
    try {
        const payload = req.user;
        if (!payload || (payload.role !== 'admin' && payload.role !== 'club_coordinator')) {
            return res.status(403).json({ error: 'only admin or club coordinator can update events' });
        }
        const eventId = req.params.eventId;
        const { title, description, date, type } = req.body;
        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (date) {
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({ error: 'invalid date format' });
            }
            updateData.date = parsedDate;
        }
        if (type) {
            const validTypes = ['exam', 'holiday', 'event', 'deadline'];
            const lowerType = type.toLowerCase();
            if (!validTypes.includes(lowerType)) {
                return res.status(400).json({ error: 'invalid event type' });
            }
            updateData.type = lowerType;
        }
        const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, { new: true });
        if (!updatedEvent) return res.status(404).json({ error: 'event not found' });
        return res.status(200).json({ event: updatedEvent });
    } catch (err) {
        console.error('update event error', err);
        return res.status(500).json({ error: 'failed to update event' });
    }
});

// Delete an event (admin or club coordinator only)
router.delete('/delete/:eventId', checkAuth, async(req, res) => {
    try {
        const payload = req.user;
        if (!payload || (payload.role !== 'admin' && payload.role !== 'club_coordinator')) {
            return res.status(403).json({ error: 'only admin or club coordinator can delete events' });
        }
        const eventId = req.params.eventId;
        const event = await Event.findByIdAndDelete(eventId);
        if (!event) return res.status(404).json({ error: 'event not found' });
        return res.status(200).json({ message: 'event deleted' });
    } catch (err) {
        console.error('delete event error', err);
        return res.status(500).json({ error: 'failed to delete event' });
    }
});

module.exports = router;