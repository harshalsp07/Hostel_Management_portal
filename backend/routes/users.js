import express from 'express';
import User from '../models/User.js';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  try {
    let serviceAccount;
    
    // Try to load from environment variable first (for Vercel)
    if (process.env.FIREBASE_KEY_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);
    } else {
      // Fall back to file system (for local development)
      const serviceAccountPath = path.join(__dirname, '../firebase-key.json');
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.warn('Firebase Admin SDK not initialized:', error.message);
  }
}

// GET /api/users/all - get all users (must be before /:uid to avoid conflict)
router.get('/all', async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    console.error('Error fetching all users:', err);
    res.status(500).json({ code: 'USER_FETCH_ERROR', message: 'Internal server error' });
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

// POST /api/users/create-by-admin - create user by admin
router.post('/create-by-admin', async (req, res) => {
  try {
    const { email, password, name, phone, roomNumber, userType } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Email, password, and name are required' });
    }

    // Create user in Firebase
    let uid;
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
      uid = userRecord.uid;
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      if (firebaseError.code === 'auth/email-already-exists') {
        return res.status(400).json({ code: 'EMAIL_EXISTS', message: 'Email already exists' });
      }
      throw firebaseError;
    }

    // Create user in MongoDB
    const newUser = new User({
      uid,
      email,
      name,
      phone,
      roomNumber,
      userType: userType || 'student',
      createdAt: new Date(),
    });

    await newUser.save();

    res.status(201).json({
      uid,
      email,
      name,
      tempPassword: password,
      userType: newUser.userType,
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ code: 'USER_CREATE_ERROR', message: err.message || 'Internal server error' });
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

    // Delete from Firebase
    try {
      await admin.auth().deleteUser(uid);
    } catch (firebaseError) {
      console.warn('Firebase delete warning:', firebaseError.message);
    }

    // Delete from MongoDB
    const result = await User.findOneAndDelete({ uid });
    if (!result) {
      return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ code: 'USER_DELETE_ERROR', message: 'Internal server error' });
  }
});

// POST /api/users/:uid/reset-password - admin resets user password
router.post('/:uid/reset-password', async (req, res) => {
  try {
    const { uid } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'newPassword is required' });
    }

    // Update password in Firebase
    try {
      await admin.auth().updateUser(uid, {
        password: newPassword,
      });
    } catch (firebaseError) {
      console.error('Firebase password update error:', firebaseError);
      return res.status(400).json({ code: 'FIREBASE_ERROR', message: firebaseError.message });
    }

    // Verify user exists in MongoDB
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    res.json({ 
      message: 'Password reset successfully',
      email: user.email,
      newPassword: newPassword
    });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ code: 'PASSWORD_RESET_ERROR', message: 'Internal server error' });
  }
});

export default router;
