import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  available: {
    type: Number,
    required: true,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Equipment', equipmentSchema);
