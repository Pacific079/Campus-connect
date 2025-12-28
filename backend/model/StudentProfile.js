const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  fullName: { type: String },
  phone: { type: String },
  address: { type: String },
  courseId: { type: String },
  batch: { type: String },
  enrollmentNo: { type: String },
  rollNumber: { type: String },
  dob: { type: String },
  meta: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
