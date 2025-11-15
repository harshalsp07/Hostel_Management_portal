const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const CleaningSchedule = require('./models/CleaningSchedule');

// Load environment variables ;
dotenv.config();

// Connect to MongoDB (cached by serverless runtime across warm invocations)
connectDB();

// Initialize cleaning schedule with rooms from database
const initializeCleaningSchedule = async () => {
  try {
    const Room = require('./models/Room');
    const rooms = await Room.find({ status: 'active' });
    
    if (rooms.length === 0) {
      console.log('No rooms found in database. Please add rooms via admin panel.');
      return;
    }

    for (const roomData of rooms) {
      await CleaningSchedule.findOneAndUpdate(
        { room: roomData.room },
        { 
          $setOnInsert: {
            room: roomData.room,
            level: roomData.level,
            status: 'scheduled',
            cleanedUntil: new Date(),
          }
        },
        { upsert: true }
      );
    }
    console.log(`Cleaning schedule initialized with ${rooms.length} rooms`);
  } catch (error) {
    console.error('Error initializing cleaning schedule:', error);
  }
};

// Initialize on startup (with delay to ensure DB connection)
setTimeout(initializeCleaningSchedule, 2000);

const app = express();

// Middleware
app.use(cors({
  origin: true, // reflect request origin to support unknown Vercel domains with credentials
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/notices', require('./routes/notices'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/cleaning', require('./routes/cleaning'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/cloudinary', require('./routes/cloudinary'));

// Health check 
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    code: 'INTERNAL_ERROR',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
