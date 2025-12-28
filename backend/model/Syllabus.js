const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
    title: { type: String, required: true },
    contentRaw: { type: String, required: true },
    mindMapData: { type: [Object] }, // Array of SyllabusTopic
    uploadedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
    attachments: [{
        type: { type: String, enum: ['pdf', 'ppt', 'image', 'link'], required: true },
        name: { type: String, required: true },
        url: { type: String, required: true },
        cloudinaryId: { type: String }, // For files uploaded to Cloudinary
        uploadedAt: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

module.exports = mongoose.model('Syllabus', syllabusSchema);