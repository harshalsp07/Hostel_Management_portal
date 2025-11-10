import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase';
import apiCall from './api';

// --- Backend (MongoDB) helpers ---
const upsertUserMongo = async (profile) => {
  try {
    const saved = await apiCall(`/users`, {
      method: 'POST',
      body: JSON.stringify(profile),
    });
    // Fetch fresh document to avoid stale projections
    const fresh = await getUserByUidMongo(saved.uid || profile.uid);
    return fresh || saved;
  } catch (e) {
    console.error('Mongo upsert user failed:', e);
    return null;
  }
};

const getUserByUidMongo = async (uid) => {
  try {
    const user = await apiCall(`/users/${uid}`);
    return user;
  } catch (e) {
    // If 404, apiCall throws with statusText; treat as not found
    console.warn('Mongo get user failed or not found:', e?.message || e);
    return null;
  }
};

// Ensure a Mongo user document exists for a given Firebase user object
export const ensureUserExists = async (firebaseUser, defaults = {}) => {
  if (!firebaseUser?.uid || !firebaseUser?.email) return null;
  let existing = await getUserByUidMongo(firebaseUser.uid);
  if (existing) return existing;
  const created = await upsertUserMongo({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    userType: defaults.userType || 'student',
    lastLogin: new Date().toISOString(),
    name: defaults.name || '',
    phone: defaults.phone || '',
    roomNumber: defaults.roomNumber || '',
  });
  return created || { uid: firebaseUser.uid, email: firebaseUser.email, userType: defaults.userType || 'student' };
};

export const loginUser = async ({ email, password }) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Prefer MongoDB profile for role-based routing; if missing, create a minimal default
    let mongoProfile = await getUserByUidMongo(user.uid);
    if (!mongoProfile) {
      mongoProfile = await upsertUserMongo({
        uid: user.uid,
        email: user.email,
        userType: 'student',
        lastLogin: new Date().toISOString(),
      });
    }
    // Always fetch fresh after any potential update
    const userProfile = (await getUserByUidMongo(user.uid)) || mongoProfile || { uid: user.uid, email: user.email, userType: 'student' };
    
    // Update last login time
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    } catch (e) {
      // Firestore may be locked by rules; ignore write errors
      console.warn('Firestore lastLogin update skipped:', e?.message || e);
    }
    
    return userProfile;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const createUserProfile = async (userData) => {
  if (!userData?.uid) return null;

  // 1) Upsert to MongoDB FIRST (source of truth for userType)
  await upsertUserMongo({
    uid: userData.uid,
    email: userData.email,
    userType: userData.userType || 'student',
    name: userData.name || '',
    phone: userData.phone || '',
    roomNumber: userData.roomNumber || '',
    lastLogin: new Date().toISOString(),
  });

  // Fetch fresh profile from Mongo
  const mongoProfile = await getUserByUidMongo(userData.uid);

  // 2) Best-effort write to Firestore (do not block on errors or reads)
  try {
    const userRef = doc(db, 'users', userData.uid);
    await setDoc(
      userRef,
      {
        uid: userData.uid,
        email: userData.email,
        userType: userData.userType || 'student',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        name: userData.name || '',
        phone: userData.phone || '',
        roomNumber: userData.roomNumber || '',
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Firestore profile write skipped:', e?.message || e);
  }

  return mongoProfile || { ...userData, id: userData.uid };
};

export const getUserProfile = async (userId) => {
  if (!userId) return null;
  
  try {
    // Only use MongoDB as source of truth for role-based routing to avoid Firestore rule issues
    const mongo = await getUserByUidMongo(userId);
    // Normalize shape to at least include uid/email/userType keys
    if (!mongo) return null;
    return {
      id: mongo.id || mongo._id || userId,
      uid: mongo.uid || userId,
      email: mongo.email,
      userType: mongo.userType || 'student',
      name: mongo.name || '',
      phone: mongo.phone || '',
      roomNumber: mongo.roomNumber || '',
      ...mongo,
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  if (!userId) return null;
  
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, updates, { merge: true });
    return { id: userId, ...updates };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
