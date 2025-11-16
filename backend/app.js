import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import CleaningSchedule from './models/CleaningSchedule.js';
import noticesRouter from './routes/notices.js';
import complaintsRouter from './routes/complaints.js';
import cleaningRouter from './routes/cleaning.js';
import equipmentRouter from './routes/equipment.js';
import usersRouter from './routes/users.js';
import roomsRouter from './routes/rooms.js';
import cloudinaryRouter from './routes/cloudinary.js';

// Load environment variables ;
dotenv.config();

// Connect to MongoDB (cached by serverless runtime across warm invocations)
connectDB();

// Initialize cleaning schedule with rooms from database
const initializeCleaningSchedule = async () => {
  try {
    const { default: Room } = await import('./models/Room.js');
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
app.use('/api/notices', noticesRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/cleaning', cleaningRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/users', usersRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/cloudinary', cloudinaryRouter);

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

export default app;
