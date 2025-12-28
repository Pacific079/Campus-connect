const mongoose = require('mongoose');

const registeredExamSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  examCode: { type: String, required: true },
  examName: { type: String, required: true },
  date: { type: String },
  time: { type: String },
  venue: { type: String },
  centerCode: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('RegisteredExam', registeredExamSchema);
