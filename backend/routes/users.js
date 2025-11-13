const express = require('express');
const router = express.Router();
const User = require('../models/User');
const admin = require('firebase-admin');

const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// GET /api/users/all - get all users
router.get('/all', async (req, res) => {
  try {
    const users = await User.find({}).lean().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching all users:', err);
    res.status(500).json({ code: 'USER_FETCH_ERROR', message: 'Internal server error' });
  }
});

// POST /api/users/create-by-admin - create user with temporary password
router.post('/create-by-admin', async (req, res) => {
  try {
    const { email, name, phone, roomNumber, userType, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).json({ code: 'USER_EXISTS', message: 'User with this email already exists' });
    }

    // Create user in Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email,
        password,
        displayName: name || '',
      });
    } catch (firebaseErr) {
      console.error('Firebase user creation error:', firebaseErr);
      return res.status(400).json({ 
        code: 'FIREBASE_ERROR', 
        message: firebaseErr.message || 'Failed to create Firebase user' 
      });
    }

    // Create user in MongoDB
    const newUser = new User({
      uid: firebaseUser.uid,
      email,
      name: name || '',
      phone: phone || '',
      roomNumber: roomNumber || '',
      userType: userType || 'student',
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      ...savedUser.toObject(),
      id: savedUser._id,
      tempPassword: password,
    });
  } catch (err) {
    console.error('Error creating user by admin:', err);
    res.status(500).json({ code: 'USER_CREATE_ERROR', message: 'Internal server error' });
  }
});

// GET /api/users/:uid - get user by Firebase UID
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid }).lean();
    if (!user) {
      return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ code: 'USER_FETCH_ERROR', message: 'Internal server error' });
  }
});

// POST /api/users - create or update (upsert) user profile
router.post('/', async (req, res) => {
  try {
    const { uid, email, userType, displayName, name, phone, roomNumber, lastLogin } = req.body || {};

    if (!uid || !email) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'uid and email are required' });
    }

    const update = {
      uid,
      email,
      userType: userType || 'student',
      displayName,
      name,
      phone,
      roomNumber,
    };

    if (lastLogin) update.lastLogin = new Date(lastLogin);

    const userDoc = await User.findOneAndUpdate(
      { uid },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.status(200).json({ ...userDoc, id: userDoc._id });
  } catch (err) {
    console.error('Error upserting user:', err);
    res.status(500).json({ code: 'USER_UPSERT_ERROR', message: 'Internal server error' });
  }
});

// PATCH /api/users/:uid - partial update (e.g., change userType)
router.patch('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const updates = req.body || {};
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'No update fields provided' });
    }
    if (updates.userType && !['student','worker','admin'].includes(updates.userType)) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Invalid userType value' });
    }
    updates.updatedAt = new Date();
    const updated = await User.findOneAndUpdate(
      { uid },
      { $set: updates },
      { new: true }
    ).lean();
    if (!updated) {
      return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found' });
    }
    res.json({ ...updated, id: updated._id });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ code: 'USER_UPDATE_ERROR', message: 'Internal server error' });
  }
});

// DELETE /api/users/:uid - delete user
router.delete('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    // Delete from Firebase Auth
    try {
      await admin.auth().deleteUser(uid);
    } catch (firebaseErr) {
      console.warn('Firebase user deletion warning:', firebaseErr.message);
    }

    // Delete from MongoDB
    const deleted = await User.findOneAndDelete({ uid }).lean();
    if (!deleted) {
      return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ code: 'USER_DELETE_ERROR', message: 'Internal server error' });
  }
});

module.exports = router;
