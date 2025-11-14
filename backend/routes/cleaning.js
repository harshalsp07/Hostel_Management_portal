const express = require('express');
const router = express.Router();
const CleaningSchedule = require('../models/CleaningSchedule');

// Get cleaning schedule (filtered by room if provided)
router.get('/', async (req, res) => {
  try {
    const { roomNumber, userType } = req.query;
    let query = {};
    
    // Students see only their room
    if (userType === 'student' && roomNumber) {
      query.room = roomNumber;
    }
    
    const schedule = await CleaningSchedule.find(query).sort({ room: 1 });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create cleaning schedule
router.post('/', async (req, res) => {
  try {
    const schedule = new CleaningSchedule(req.body);
    const newSchedule = await schedule.save();
    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update cleaning status
router.put('/:id', async (req, res) => {
  try {
    const schedule = await CleaningSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // Emit otp-verified when a room is marked cleaned so clients update in real time
    try {
      if (global.io && req.body.status === 'cleaned') {
        global.io.emit('otp-verified', schedule);
      }
    } catch (e) {
      console.warn('Socket emit failed for otp-verified', e);
    }

    res.json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.post('/request', async (req, res) => {
  try {
    const { roomNumber, requestedBy, requestedAt } = req.body;

    // generate a 6-digit OTP server-side for security and persistence
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    console.log("Cleaning request received:", { roomNumber, requestedBy, requestedAt, otp });

    // Persist the OTP on the cleaning schedule document so workers can see it
    const updated = await CleaningSchedule.findOneAndUpdate(
      { room: roomNumber },
      { $set: { otp: otp, otpCreatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Emit real-time event so workers/admins get notified immediately
    try {
      if (global.io) {
        global.io.emit('cleaning-requested', updated);
      }
    } catch (e) {
      console.warn('Socket emit failed for cleaning-requested', e);
    }

    res.json({ success: true, message: 'Cleaning request logged', schedule: updated, otp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
