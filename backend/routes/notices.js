import express from 'express';
import Notice from '../models/Notice.js';

const router = express.Router();

// Get all notices
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create notice
router.post('/', async (req, res) => {
  try {
    const notice = new Notice(req.body);
    const newNotice = await notice.save();
    res.status(201).json(newNotice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update notice
router.put('/:id', async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(notice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete notice
router.delete('/:id', async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
