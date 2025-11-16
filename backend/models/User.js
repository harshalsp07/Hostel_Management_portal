import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    displayName: { type: String },
    name: { type: String },
    phone: { type: String },
    roomNumber: { type: String },
    userType: {
      type: String,
      enum: ['student', 'worker', 'admin'],
      default: 'student',
      index: true,
    },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
