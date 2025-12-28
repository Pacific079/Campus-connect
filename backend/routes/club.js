const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const Club = require('../model/Club');
const mongoose = require('mongoose');

// Get pending clubs (admin only)
router.get('/pending', checkAuth, async (req, res) => {
  try {
    const payload = req.user;
    if (!payload || payload.role !== 'admin') {
      return res.status(403).json({ error: 'only admin can view pending clubs' });
    }
    const pendingClubs = await Club.find({ isApproved: false }).select('_id userId clubName clubEmail clubDescription membersCount createdAt').lean();
    return res.status(200).json({ clubs: pendingClubs });
  } catch (err) {
    console.error('pending clubs error', err);
    return res.status(500).json({ error: 'failed to load pending clubs' });
  }
});

// Get all approved clubs
router.get('/all', async (req, res) => {
  try {
    const approvedClubs = await Club.find({ isApproved: true }).select('_id clubName clubEmail clubDescription membersCount').lean();
    return res.status(200).json({ clubs: approvedClubs });
  } catch (err) {
    console.error('all clubs error', err);
    return res.status(500).json({ error: 'failed to load clubs' });
  }
});

// Approve a club (admin only)
router.post('/approve/:clubId', checkAuth, async (req, res) => {
  try {
    const payload = req.user;
    if (!payload || payload.role !== 'admin') {
      return res.status(403).json({ error: 'only admin can approve clubs' });
    }
    const clubId = req.params.clubId;
    const approvedClub = await Club.findByIdAndUpdate(clubId, { isApproved: true }, { new: true });
    if (!approvedClub) return res.status(404).json({ error: 'club not found' });
    return res.status(200).json({ message: 'club approved', club: approvedClub });
  } catch (err) {
    console.error('approve club error', err);
    return res.status(500).json({ error: 'failed to approve club' });
  }
});

// Reject a club (admin only)
router.delete('/reject/:clubId', checkAuth, async (req, res) => {
  try {
    const payload = req.user;
    if (!payload || payload.role !== 'admin') {
      return res.status(403).json({ error: 'only admin can reject clubs' });
    }
    const clubId = req.params.clubId;
    const club = await Club.findByIdAndDelete(clubId);
    if (!club) return res.status(404).json({ error: 'club not found' });
    return res.status(200).json({ message: 'club rejected and deleted' });
  } catch (err) {
    console.error('reject club error', err);
    return res.status(500).json({ error: 'failed to reject club' });
  }
});

// Create a club (protected)
router.post('/create', checkAuth, async (req, res) => {
  try {
    const payload = req.user;
    if (!payload || !payload.uId) return res.status(400).json({ error: 'invalid token payload' });
    const { clubName, clubEmail, clubDescription, membersCount } = req.body;
    if (!clubName) return res.status(400).json({ error: 'clubName required' });
    const newClub = await Club.create({
      userId: payload.uId,
      clubName,
      clubEmail,
      clubDescription,
      membersCount: membersCount || 0,
      isApproved: false,
    });
    return res.status(200).json({ club: newClub });
  } catch (err) {
    console.error('create club error', err);
    return res.status(500).json({ error: 'failed to create club' });
  }
});

module.exports = router;
