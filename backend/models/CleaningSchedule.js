const mongoose = require('mongoose');

const cleaningScheduleSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  last: {
    type: String,
  },
  next: {
    type: String,
  },
  otp: {
    type: String,
  },
  otpCreatedAt: {
    type: Date,
  },
  cleanedUntil: {
    type: Date,
  },
  lastCleaningRequestAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['cleaned', 'needs-cleaning', 'scheduled'],
    default: 'scheduled',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CleaningSchedule', cleaningScheduleSchema);
