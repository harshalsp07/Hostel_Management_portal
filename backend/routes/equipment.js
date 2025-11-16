import express from 'express';
import Equipment from '../models/Equipment.js';

const router = express.Router();

// Get all equipment
router.get('/', async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ name: 1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create equipment
router.post('/', async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    const newEquipment = await equipment.save();
    res.status(201).json(newEquipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update equipment
router.put('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(equipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete equipment
router.delete('/:id', async (req, res) => {
  try {
    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Equipment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
