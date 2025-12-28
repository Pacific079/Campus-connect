const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  clubName: { type: String, required: true },
  clubEmail: { type: String },
  clubDescription: { type: String },
  membersCount: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);
