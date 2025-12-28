const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  instituteName: { type: String },
  phone: { type: String },
  department: { type: String },
  address: { type: String },
  meta: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('AdminProfile', adminProfileSchema);
