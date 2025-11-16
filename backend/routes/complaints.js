import express from 'express';
import Complaint from '../models/Complaint.js';

const router = express.Router();

// Get complaints (filtered by userId if provided)
router.get('/', async (req, res) => {
  try {
    const { userId, userType } = req.query;
    let query = {};
    
    // Students see only their complaints
    if (userType === 'student' && userId) {
      query.userId = userId;
    }
    
    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create complaint
router.post('/', async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    const newComplaint = await complaint.save();
    res.status(201).json(newComplaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update complaint
router.put('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(complaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete complaint
router.delete('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json({ message: 'Complaint deleted successfully', complaint });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
