const mongoose = require('mongoose');

const clubCoordinatorSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  phone: { type: String },
  clubName: { type: String },
  clubEmail: { type: String },
  clubDescription: { type: String },
  meta: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('ClubCoordinatorProfile', clubCoordinatorSchema);
