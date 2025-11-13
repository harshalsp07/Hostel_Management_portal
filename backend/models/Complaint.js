const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open',
  },
  category: {
    type: String,
    enum: ['Electritian', 'Carpenter', 'Plumber', 'Ac Issue', 'Other'],
    default: 'Other',
  },
  tags: [{
    type: String,
  }],
  date: {
    type: String,
  },
  image: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Complaint', complaintSchema);
