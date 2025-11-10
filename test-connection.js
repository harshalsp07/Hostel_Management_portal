const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Suppress strictQuery warning
mongoose.set('strictQuery', false);

const testConnection = async () => {
  console.log('🔍 Testing MongoDB Connection...\n');
  console.log('📝 Connection String:', process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_management');
  console.log('');

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_management');
    
    console.log('✅ SUCCESS! MongoDB Connected');
    console.log('📊 Host:', conn.connection.host);
    console.log('📚 Database:', conn.connection.name);
    console.log('🔌 Port:', conn.connection.port);
    console.log('');
    console.log('🎉 Your MongoDB connection is working perfectly!');
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ CONNECTION FAILED!');
    console.error('📛 Error:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Check if MongoDB is running: sudo systemctl status mongod');
    console.log('   2. For Atlas: Verify IP whitelist in Network Access');
    console.log('   3. Check username/password are correct');
    console.log('   4. Ensure database name is in connection string');
    process.exit(1);
  }
};

testConnection();
