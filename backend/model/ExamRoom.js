const mongoose = require('mongoose');

const examRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    rows: {
        type: Number,
        required: true,
        min: 1
    },
    cols: {
        type: Number,
        required: true,
        min: 1
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    building: {
        type: String,
        default: 'Main Building'
    },
    floor: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Calculate capacity automatically if not provided
examRoomSchema.pre('save', function(next) {
    if (!this.capacity) {
        this.capacity = this.rows * this.cols;
    }
    next();
});

module.exports = mongoose.model('ExamRoom', examRoomSchema);