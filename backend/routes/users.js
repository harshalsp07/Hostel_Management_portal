const express = require('express');
const router = express.Router();
const User = require('../models/User');

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

module.exports = router;
