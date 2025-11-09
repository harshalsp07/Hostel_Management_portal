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

    const user = await User.findOneAndUpdate(
      { uid },
      { $set: update, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, new: true }
    ).lean();

    res.status(200).json(user);
  } catch (err) {
    console.error('Error upserting user:', err);
    res.status(500).json({ code: 'USER_UPSERT_ERROR', message: 'Internal server error' });
  }
});

module.exports = router;
