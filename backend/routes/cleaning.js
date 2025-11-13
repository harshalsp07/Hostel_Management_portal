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
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Request cleaning for a room
router.post('/request', async (req, res) => {
  try {
    const { roomNumber, requestedBy, requestedAt } = req.body;
    
    if (!roomNumber || !requestedBy) {
      return res.status(400).json({ message: 'Room number and requestedBy are required' });
    }

    // Update the cleaning schedule to mark as "needs-cleaning" and add request info
    const schedule = await CleaningSchedule.findOneAndUpdate(
      { room: roomNumber },
      { 
        status: 'needs-cleaning',
        lastRequestedBy: requestedBy,
        lastRequestedAt: new Date(requestedAt),
      },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ message: 'Room not found in cleaning schedule' });
    }

    res.json({ message: 'Cleaning request submitted successfully', schedule });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
