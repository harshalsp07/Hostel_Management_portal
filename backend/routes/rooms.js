import express from 'express';
import Room from '../models/Room.js';
import CleaningSchedule from '../models/CleaningSchedule.js';

const router = express.Router();

// GET /api/rooms - get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({}).sort({ room: 1 });
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/rooms - create a new room (admin only)
router.post('/', async (req, res) => {
  try {
    const { room, level, capacity, status } = req.body;

    if (!room || !level) {
      return res.status(400).json({ message: 'Room number and level are required' });
    }

    // Check if room already exists
    const existingRoom = await Room.findOne({ room });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room already exists' });
    }

    // Create room
    const newRoom = new Room({
      room,
      level,
      capacity: capacity || 2,
      status: status || 'active',
    });

    await newRoom.save();

    // Create corresponding cleaning schedule entry
    const cleaningSchedule = new CleaningSchedule({
      room,
      level,
      status: 'scheduled',
      cleanedUntil: new Date(),
    });

    await cleaningSchedule.save();

    res.status(201).json({
      message: 'Room created successfully',
      room: newRoom,
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/rooms/:id - update room (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { capacity, status } = req.body;
    const updates = {};

    if (capacity !== undefined) updates.capacity = capacity;
    if (status !== undefined) updates.status = status;

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      message: 'Room updated successfully',
      room: updatedRoom,
    });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/rooms/:id - delete room (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Also delete corresponding cleaning schedule
    await CleaningSchedule.deleteOne({ room: room.room });

    res.json({
      message: 'Room deleted successfully',
      room,
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
