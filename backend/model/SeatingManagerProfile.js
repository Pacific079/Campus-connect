const mongoose = require('mongoose');

const seatingManagerSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  phone: { type: String },
  department: { type: String },
  roomsManaged: [{ type: String }],
  shift: { type: String },
  meta: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('SeatingManagerProfile', seatingManagerSchema);
