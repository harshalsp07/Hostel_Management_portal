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
  status: {
    type: String,
    enum: ['cleaned', 'needs-cleaning', 'scheduled'],
    default: 'scheduled',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CleaningSchedule', cleaningScheduleSchema);
