import { useEffect, useState } from 'react'
import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { AuthForm } from './Login.jsx'
import { HostelDashboard, AdminDashboard, WorkerDashboard } from './Dashboard.jsx'
import { firebaseConfig as defaultFirebaseConfig } from '../firebase.js'

// --- Firebase Configuration ---
// These global variables are provided by the environment.
const envFirebaseConfigString = typeof __firebase_config !== 'undefined' ? __firebase_config : null
const firebaseConfig = envFirebaseConfigString ? JSON.parse(envFirebaseConfigString) : defaultFirebaseConfig
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null

// Initialize Firebase App (only if config is valid)
let app
let auth
if (firebaseConfig.apiKey) {
  const existingApps = getApps()
  app = existingApps.length ? existingApps[0] : initializeApp(firebaseConfig)
  auth = getAuth(app)
}

// This function signs in the environment, not the end-user.
const performInitialAuth = async () => {
  if (!auth) return
  try {
    if (initialAuthToken) {
      await signInWithCustomToken(auth, initialAuthToken)
    } else {
      await signInAnonymously(auth)
    }
  } catch (error) {
    console.error('Initial auth error:', error)
  }
}

const getFriendlyErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.'
    case 'auth/email-already-in-use':
      return 'This email address is already in use.'
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.'
    default:
      return error.message
  }
}

export default function App() {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState({ text: '', isError: false })
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!firebaseConfig.apiKey) {
      setIsLoading(false)
      return
    }

    let unsubscribe = () => {}

    performInitialAuth().then(() => {
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser && currentUser.email) {
          setUser(currentUser)
        } else {
          setUser(null)
        }
        setIsLoading(false)
      })
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleAuthSubmit = async ({ mode, email, password, userType }) => {
    if (!auth) return
    setIsProcessing(true)
    setMessage({ text: mode === 'login' ? 'Signing in...' : 'Creating account...', isError: false })
    console.log('User Type:', userType);
    // Persist the last selected userType locally so we can demo role-based UI without a backend user role
    setUserType(userType)
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
        setMessage({ text: 'Login successful!', isError: false })
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
        setMessage({ text: 'Account created successfully!', isError: false })
      }
    } catch (error) {
      setMessage({ text: getFriendlyErrorMessage(error), isError: true })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLogout = async () => {
    if (!auth) return
    try {
      await signOut(auth)
      await performInitialAuth()
      setUserType(null)
    } catch (error) {
      console.error('Logout Error:', error)
    }
  }

  const clearMessage = () => {
    setMessage({ text: '', isError: false })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl font-medium text-gray-700">Loading...</div>
      </div>
    )
  }

  if (!firebaseConfig.apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
        <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg">
          <h2 className="text-center text-2xl font-bold text-red-600">Firebase Configuration Error</h2>
          <p className="mt-4 text-center text-gray-600">
            The application is not configured to connect to Firebase. Please check the setup.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      {user ? (
        // Render dashboard according to userType (falls back to HostelDashboard)
        userType === 'admin' ? (
          <AdminDashboard user={user} userType={userType} onLogout={handleLogout} />
        ) : userType === 'worker' ? (
          <WorkerDashboard user={user} userType={userType} onLogout={handleLogout} />
        ) : (
          <HostelDashboard user={user} userType={userType} onLogout={handleLogout} />
        )
      ) : (
        <AuthForm
          onSubmit={handleAuthSubmit}
          message={message}
          setMessage={setMessage}
          onClearMessage={clearMessage}
          isProcessing={isProcessing}
        />
      )}
    </div>
  )
}

