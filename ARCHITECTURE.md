# System Architecture

## Overview
Hostel Management System using **MongoDB + Firebase hybrid architecture**

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                    React + Vite + Vite                      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Login.jsx  │  │  Dashboard   │  │  Components  │    │
│  │              │  │   Student    │  │  - Notices   │    │
│  │  - Signup    │  │   Worker     │  │  - Complaints│    │
│  │  - Login     │  │   Admin      │  │  - Cleaning  │    │
│  │              │  │              │  │  - Equipment │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                  │            │
└─────────┼─────────────────┼──────────────────┼────────────┘
          │                 │                  │
          │                 │                  │
          ▼                 │                  ▼
    ┌─────────┐             │           ┌──────────┐
    │ Firebase│             │           │   API    │
    │  Auth   │             │           │ Services │
    │         │             │           └────┬─────┘
    │ - Login │             │                │
    │ - Signup│             │                │
    └────┬────┘             │                │
         │                  │                │
         ▼                  ▼                ▼
    ┌─────────┐       ┌────────────────────────┐
    │Firestore│       │   EXPRESS BACKEND      │
    │         │       │   (Node.js + Express)  │
    │userType │       │                        │
    │ only    │       │  ┌──────────────────┐  │
    └─────────┘       │  │  API Routes      │  │
                      │  │  /api/notices    │  │
                      │  │  /api/complaints │  │
                      │  │  /api/cleaning   │  │
                      │  │  /api/equipment  │  │
                      │  └────────┬─────────┘  │
                      │           │            │
                      │           ▼            │
                      │  ┌──────────────────┐  │
                      │  │  MongoDB Models  │  │
                      │  │  - Notice        │  │
                      │  │  - Complaint     │  │
                      │  │  - Cleaning      │  │
                      │  │  - Equipment     │  │
                      │  └────────┬─────────┘  │
                      └───────────┼────────────┘
                                  │
                                  ▼
                            ┌──────────┐
                            │ MongoDB  │
                            │ Database │
                            │          │
                            │ All Data │
                            └──────────┘
```

## Data Storage Strategy

### Firebase Firestore (Minimal Usage)
**Purpose**: Authentication + User Type Storage Only

**Stored Data:**
```javascript
users/{userId} {
  uid: string,
  email: string,
  userType: 'student' | 'worker' | 'admin',  // ← ONLY user type
  name: string,
  phone: string,
  roomNumber: string,
  createdAt: timestamp,
  lastLogin: timestamp
}
```

### MongoDB (Primary Database)
**Purpose**: All Application Data

**Collections:**

1. **notices**
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  priority: 'low' | 'medium' | 'high',
  date: String,
  createdAt: Date,
  updatedAt: Date
}
```

2. **complaints**
```javascript
{
  _id: ObjectId,
  userId: String,         // Firebase user ID
  name: String,
  room: String,
  content: String,
  status: 'Open' | 'In Progress' | 'Resolved',
  tags: [String],
  date: String,
  createdAt: Date,
  updatedAt: Date
}
```

3. **cleaningSchedule**
```javascript
{
  _id: ObjectId,
  room: String,
  level: String,
  last: String,
  next: String,
  status: 'cleaned' | 'needs-cleaning' | 'scheduled',
  createdAt: Date,
  updatedAt: Date
}
```

4. **equipment**
```javascript
{
  _id: ObjectId,
  name: String,
  available: Number,
  total: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication Flow

```
┌──────────┐
│  User    │
│  Opens   │
│  App     │
└────┬─────┘
     │
     ▼
┌─────────────────┐
│  Login/Signup   │
│  Form           │
└────┬────────────┘
     │
     ├─── Signup ───────────────┐
     │                          │
     │                          ▼
     │                   ┌──────────────────┐
     │                   │ Firebase Auth    │
     │                   │ Create Account   │
     │                   └────────┬─────────┘
     │                            │
     │                            ▼
     │                   ┌──────────────────┐
     │                   │ Save to Firestore│
     │                   │ userType stored  │
     │                   └────────┬─────────┘
     │                            │
     ├─── Login ────────────┐     │
     │                      │     │
     ▼                      ▼     ▼
┌──────────────────────────────────┐
│  Firebase Auth Verification      │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Load userType from Firestore    │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Redirect to Dashboard           │
│  Based on userType:              │
│  - student → Student Dashboard   │
│  - worker → Worker Dashboard     │
│  - admin → Admin Dashboard       │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Load Data from MongoDB          │
│  via Backend API                 │
└──────────────────────────────────┘
```

## API Request Flow

```
Frontend Component
      │
      │ useEffect / onClick
      ▼
Service Layer (src/services/)
      │
      │ fetch() with headers
      ▼
Backend API Route
      │
      │ Express middleware
      ▼
MongoDB Query
      │
      │ Mongoose
      ▼
Database Operation
      │
      ▼
Response sent back
      │
      ▼
Frontend updates state
      │
      ▼
UI re-renders
```

## Role-Based Access Control

### Student
- **Can View**: Notices, Equipment, Own Room Cleaning
- **Can Add**: Own Complaints
- **Cannot**: Edit/Delete anything

### Worker
- **Can View**: All Notices, All Cleaning, All Complaints, Equipment
- **Can Add**: Notices
- **Can Update**: Cleaning Status, Complaint Status
- **Cannot**: Delete anything, Edit Equipment

### Admin
- **Can View**: Everything
- **Can Add**: Notices, Equipment, Cleaning Schedules
- **Can Update**: Everything
- **Can Delete**: Notices, Equipment

## Why This Architecture?

### Benefits of MongoDB for Main Data
✅ **Flexible Schema** - Easy to add new fields
✅ **Better Performance** - Optimized for complex queries
✅ **No Cost Concerns** - Free for small apps
✅ **Full Control** - Own your data
✅ **Easier Backups** - Standard MongoDB tools
✅ **Better for Relations** - Better handling of related data

### Why Keep Firebase?
✅ **Easy Authentication** - No need to build from scratch
✅ **Secure** - Industry-standard auth
✅ **User Management** - Built-in user admin panel
✅ **Already Set Up** - Minimal changes needed

### Trade-offs
⚠️ **Two Databases** - Slightly more complex setup
⚠️ **Deployment** - Need to host backend server
✅ **Better Scalability** - Can scale MongoDB independently
✅ **Cost Effective** - MongoDB Atlas free tier is generous

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **CSS** - Styling

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

### Databases
- **MongoDB** - Primary database
- **Firebase Firestore** - User type only

### Authentication
- **Firebase Auth** - User authentication

## Deployment Recommendations

### Frontend
- **Vercel** or **Netlify** (Free tier available)
- Environment variable: `VITE_API_URL`

### Backend
- **Railway** or **Render** (Free tier available)
- Environment variables: `MONGODB_URI`, `PORT`

### Database
- **MongoDB Atlas** (Free 512MB cluster)

### Firebase
- Already hosted by Google
- Just need to keep it for auth

## Security Considerations

1. **API Security**
   - Add authentication middleware to backend routes
   - Verify Firebase tokens on backend
   - Rate limiting for API endpoints

2. **Database Security**
   - Use MongoDB connection with authentication
   - Implement proper indexes
   - Regular backups

3. **Environment Variables**
   - Never commit `.env` files
   - Use different configs for dev/prod
   - Rotate secrets regularly

4. **User Data**
   - Hash sensitive data
   - Implement proper authorization checks
   - Audit logs for admin actions
