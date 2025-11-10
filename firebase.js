import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDuTgcS8zNMm-5PZNirSnLV3Cb9PJZ_SHg",
  authDomain: "hostelmanegement07.firebaseapp.com",
  projectId: "hostelmanegement07",
  storageBucket: "hostelmanegement07.firebasestorage.app",
  messagingSenderId: "737398463793",
  appId: "1:737398463793:web:048377770d314442dfe410",
  measurementId: "G-DJ2NRLSY7H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics, firebaseConfig };
