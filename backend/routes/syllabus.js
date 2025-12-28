const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const Syllabus = require('../model/Syllabus');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

console.log('Syllabus routes being registered...');

// Debug route
router.get('/debug', (req, res) => {
    return res.status(200).json({ message: 'Syllabus router is working' });
});

// Get all syllabi
router.get('/all', async(req, res) => {
    try {
        const syllabi = await Syllabus.find().select('_id title contentRaw mindMapData attachments uploadedBy createdAt').lean();
        return res.status(200).json({ syllabi });
    } catch (err) {
        console.error('all syllabi error', err);
        return res.status(500).json({ error: 'failed to load syllabi' });
    }
});

// Upload syllabus (admin only)
router.post('/upload', checkAuth, async(req, res) => {
    try {
        const payload = req.user;
        if (!payload || payload.role !== 'admin') {
            return res.status(403).json({ error: 'only admin can upload syllabi' });
        }
        const { title, contentRaw } = req.body;
        if (!title || !contentRaw) {
            return res.status(400).json({ error: 'title and contentRaw required' });
        }
        const newSyllabus = await Syllabus.create({
            title,
            contentRaw,
            uploadedBy: payload.uId,
            attachments: [],
        });
        return res.status(200).json({ syllabus: newSyllabus });
    } catch (err) {
        console.error('upload syllabus error', err);
        return res.status(500).json({ error: 'failed to upload syllabus' });
    }
});

// Add attachment to syllabus (admin only)
router.post('/add-attachment/:syllabusId', checkAuth, async(req, res) => {
    try {
        console.log('🔧 add-attachment endpoint hit');
        console.log('Path params:', req.params);
        console.log('Body:', req.body);
        console.log('Files:', req.files ? Object.keys(req.files) : 'no files');
        
        const payload = req.user;
        if (!payload || payload.role !== 'admin') {
            return res.status(403).json({ error: 'only admin can add attachments' });
        }

        const syllabusId = req.params.syllabusId;
        const { attachmentType, attachmentName, attachmentUrl } = req.body;

        console.log('Add attachment request:', { attachmentType, attachmentName, hasFile: !!req.files?.file });

        let cloudinaryId = null;
        let finalUrl = attachmentUrl;

        // If file is uploaded
        if (req.files && req.files.file) {
            const file = req.files.file;
            const resourceType = attachmentType === 'pdf' || attachmentType === 'ppt' ? 'auto' : 'image';

            console.log(`Uploading file: ${file.name}, type: ${resourceType}`);

            try {
                const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
                    resource_type: resourceType,
                    folder: 'campus-connect/syllabi',
                });
                finalUrl = uploadResult.secure_url;
                cloudinaryId = uploadResult.public_id;
                console.log('✅ Cloudinary upload successful:', cloudinaryId);
            } catch (uploadErr) {
                console.error('❌ Cloudinary upload error:', uploadErr);
                return res.status(500).json({ error: 'File upload failed', details: uploadErr.message });
            }
        } else if (!attachmentUrl && attachmentType !== 'link') {
            return res.status(400).json({ error: 'File or URL required' });
        }

        const syllabus = await Syllabus.findById(syllabusId);
        if (!syllabus) {
            return res.status(404).json({ error: 'syllabus not found' });
        }

        const attachment = {
            type: attachmentType,
            name: attachmentName || 'Untitled',
            url: finalUrl,
            cloudinaryId,
            uploadedAt: new Date(),
        };

        syllabus.attachments.push(attachment);
        const updatedSyllabus = await syllabus.save();

        return res.status(200).json({
            message: 'attachment added successfully',
            attachment: attachment,
            syllabus: updatedSyllabus
        });
    } catch (err) {
        console.error('❌ add attachment error:', err);
        return res.status(500).json({ error: 'failed to add attachment', details: err.message });
    }
});

// Delete attachment from syllabus (admin only)
router.delete('/delete-attachment/:syllabusId/:attachmentIndex', checkAuth, async(req, res) => {
    try {
        const payload = req.user;
        if (!payload || payload.role !== 'admin') {
            return res.status(403).json({ error: 'only admin can delete attachments' });
        }

        const { syllabusId, attachmentIndex } = req.params;
        const index = parseInt(attachmentIndex);

        const syllabus = await Syllabus.findById(syllabusId);
        if (!syllabus) {
            return res.status(404).json({ error: 'syllabus not found' });
        }

        if (index < 0 || index >= syllabus.attachments.length) {
            return res.status(400).json({ error: 'invalid attachment index' });
        }

        const attachment = syllabus.attachments[index];

        // Delete from Cloudinary if it was uploaded there
        if (attachment.cloudinaryId) {
            try {
                await cloudinary.uploader.destroy(attachment.cloudinaryId);
            } catch (err) {
                console.warn('Cloudinary delete failed:', err);
            }
        }

        syllabus.attachments.splice(index, 1);
        const updatedSyllabus = await syllabus.save();

        return res.status(200).json({
            message: 'attachment deleted successfully',
            syllabus: updatedSyllabus
        });
    } catch (err) {
        console.error('delete attachment error', err);
        return res.status(500).json({ error: 'failed to delete attachment' });
    }
});

// Update syllabus mind map
router.put('/update-mindmap/:syllabusId', checkAuth, async(req, res) => {
    try {
        const payload = req.user;
        if (!payload || payload.role !== 'admin') {
            return res.status(403).json({ error: 'only admin can update syllabi' });
        }
        const syllabusId = req.params.syllabusId;
        const { mindMapData } = req.body;
        const updatedSyllabus = await Syllabus.findByIdAndUpdate(syllabusId, { mindMapData }, { new: true });
        if (!updatedSyllabus) return res.status(404).json({ error: 'syllabus not found' });
        return res.status(200).json({ syllabus: updatedSyllabus });
    } catch (err) {
        console.error('update syllabus error', err);
        return res.status(500).json({ error: 'failed to update syllabus' });
    }
});

// Delete syllabus (admin only)
router.delete('/delete/:syllabusId', checkAuth, async(req, res) => {
    try {
        const payload = req.user;
        if (!payload || payload.role !== 'admin') {
            return res.status(403).json({ error: 'only admin can delete syllabi' });
        }
        const syllabusId = req.params.syllabusId;
        const deletedSyllabus = await Syllabus.findByIdAndDelete(syllabusId);
        if (!deletedSyllabus) return res.status(404).json({ error: 'syllabus not found' });
        return res.status(200).json({ message: 'syllabus deleted successfully', syllabus: deletedSyllabus });
    } catch (err) {
        console.error('delete syllabus error', err);
        return res.status(500).json({ error: 'failed to delete syllabus' });
    }
});

module.exports = router;