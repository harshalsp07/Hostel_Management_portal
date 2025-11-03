// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDuTgcS8zNMm-5PZNirSnLV3Cb9PJZ_SHg",
  authDomain: "hostelmanegement07.firebaseapp.com",
  projectId: "hostelmanegement07",
  storageBucket: "hostelmanegement07.firebasestorage.app",
  messagingSenderId: "737398463793",
  appId: "1:737398463793:web:048377770d314442dfe410",
  measurementId: "G-DJ2NRLSY7H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { firebaseConfig, app, analytics };