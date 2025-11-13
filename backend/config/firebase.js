const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Initialize Firebase Admin SDK
let serviceAccount = null;

// Try to load from file first (firebase-key.json)
const keyFilePath = path.join(__dirname, '../firebase-key.json');
if (fs.existsSync(keyFilePath)) {
  try {
    serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    console.log('Firebase service account loaded from firebase-key.json');
  } catch (error) {
    console.error('Error reading firebase-key.json:', error.message);
  }
}

// Fall back to environment variable if file not found
if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    console.log('Firebase service account loaded from environment variable');
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
  }
}

if (!serviceAccount) {
  console.warn('Warning: Firebase service account key not found');
  console.warn('Create backend/firebase-key.json or set FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
  console.warn('Firebase Admin SDK will not be initialized. User creation endpoints will fail.');
} else {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✓ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    console.warn('Firebase Admin SDK initialization failed. User creation endpoints will fail.');
  }
}

module.exports = admin;
