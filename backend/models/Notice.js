import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  date: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Notice', noticeSchema);
