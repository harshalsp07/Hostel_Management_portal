const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Notice = require('./models/Notice');
const Equipment = require('./models/Equipment');
const CleaningSchedule = require('./models/CleaningSchedule');

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_management');
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await Notice.deleteMany({});
    await Equipment.deleteMany({});
    await CleaningSchedule.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Add Notices
    const notices = await Notice.insertMany([
      {
        title: 'Welcome to Hostel Management System',
        content: 'Welcome to our new hostel management portal. Please register to access all features.',
        priority: 'high',
        date: 'Nov 9, 2025'
      },
      {
        title: 'Mess Timing Change',
        content: 'Dinner timing changed to 8:00 PM - 10:00 PM starting tomorrow.',
        priority: 'high',
        date: 'Nov 9, 2025'
      },
      {
        title: 'Water Supply Maintenance',
        content: 'Water supply will be interrupted on Sunday from 10 AM to 2 PM.',
        priority: 'medium',
        date: 'Nov 8, 2025'
      },
      {
        title: 'Cultural Night',
        content: 'Annual cultural night on Nov 15. Register at the reception.',
        priority: 'low',
        date: 'Nov 7, 2025'
      }
    ]);
    console.log(`✅ Added ${notices.length} notices`);

    // Add Equipment
    const equipment = await Equipment.insertMany([
      { name: 'Table Tennis Rackets', available: 7, total: 12 },
      { name: 'Table Tennis Balls', available: 18, total: 30 },
      { name: 'Badminton Rackets', available: 5, total: 10 },
      { name: 'Badminton Shuttlecocks', available: 12, total: 20 },
      { name: 'Chess Boards', available: 3, total: 5 },
      { name: 'Carrom Boards', available: 2, total: 3 }
    ]);
    console.log(`✅ Added ${equipment.length} equipment items`);

    // Add Cleaning Schedule
    const cleaningSchedule = await CleaningSchedule.insertMany([
      { room: 'C301', level: 'Level 1', last: 'Today, 09:00 AM', next: 'Tomorrow, 09:00 AM', status: 'cleaned' },
      { room: 'C302', level: 'Level 1', last: 'Nov 8, 2025', next: 'Nov 10, 2025', status: 'needs-cleaning' },
      { room: 'C303', level: 'Level 1', last: 'Nov 7, 2025', next: 'Nov 11, 2025', status: 'scheduled' },
      { room: 'C304', level: 'Level 2', last: 'Today, 08:00 AM', next: 'Tomorrow, 08:00 AM', status: 'cleaned' },
      { room: 'C305', level: 'Level 2', last: 'Nov 6, 2025', next: 'Nov 12, 2025', status: 'scheduled' },
      { room: 'C306', level: 'Level 2', last: 'Nov 8, 2025', next: 'Nov 10, 2025', status: 'needs-cleaning' },
      { room: 'C307', level: 'Level 3', last: 'Today, 10:00 AM', next: 'Tomorrow, 10:00 AM', status: 'cleaned' },
      { room: 'C308', level: 'Level 3', last: 'Nov 7, 2025', next: 'Nov 11, 2025', status: 'scheduled' }
    ]);
    console.log(`✅ Added ${cleaningSchedule.length} cleaning schedules`);

    console.log('\n🎉 Sample data added successfully!');
    console.log('📝 You can now:');
    console.log('   1. Start the backend: npm run dev');
    console.log('   2. Start the frontend: cd .. && npm run dev');
    console.log('   3. Create a user account and login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
