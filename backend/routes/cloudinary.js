import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dqdbg6ezk',
  api_key: process.env.CLOUDINARY_API_KEY || '581241147672122',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'CsS4lwzYJnP1EkJ0UvlTV-Tvhb8',
});

router.post('/delete', async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    res.json(result);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;
