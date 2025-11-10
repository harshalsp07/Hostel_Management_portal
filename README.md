# Hostel Management System

A complete hostel management system with role-based dashboards using **MongoDB** for data storage and **Firebase** for authentication.

## Architecture
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB (for notices, complaints, cleaning, equipment)
- **Authentication**: Firebase (for user auth and userType storage)

## Features
- 🔐 **Role-based Authentication** (Student, Worker, Admin)
- 📢 **Notice Board Management**
- 🛠️ **Complaint Tracking System**
- 🧹 **Cleaning Schedule Management**
- 📦 **Equipment Inventory**

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Firebase account

## Setup Instructions

### 1. Install MongoDB
**Option A: Local MongoDB**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string

### 2. Setup Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your MongoDB URI
# For local: mongodb://localhost:27017/hostel_management
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/hostel_management
```

### 3. Setup Frontend
```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env if backend is not on localhost:5000
```

### 4. Configure Firebase (Authentication Only)
Firebase is used ONLY for user authentication and storing userType.

1. Go to https://console.firebase.google.com
2. Select your project: `hostelmanegement07`
3. Enable **Authentication** → Email/Password
4. Enable **Firestore** → Create database
5. Your Firebase config is already in `firebase.js`

### 5. Add Sample Data to MongoDB

**Start the backend server first:**
```bash
cd backend
npm run dev
```

**Then add sample data using these API calls:**

**Sample Notices:**
```bash
curl -X POST http://localhost:5000/api/notices \
  -H "Content-Type: application/json" \
  -d '{"title":"Welcome","content":"Welcome to hostel!","priority":"high","date":"Nov 9, 2025"}'
```

**Sample Equipment:**
```bash
curl -X POST http://localhost:5000/api/equipment \
  -H "Content-Type: application/json" \
  -d '{"name":"Table Tennis Rackets","available":8,"total":12}'
```

**Sample Cleaning Schedule:**
```bash
curl -X POST http://localhost:5000/api/cleaning \
  -H "Content-Type: application/json" \
  -d '{"room":"C301","level":"Level 1","last":"Today, 9:00 AM","next":"Tomorrow, 9:00 AM","status":"cleaned"}'
```

### 6. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Open browser: http://localhost:5173

## User Flow

```mermaid
flowchart TD
    A[Open Website] --> B[See Login/Signup Screen]
    B --> C{New User?}
    C -- Yes --> D[Sign Up with User Type]
    C -- No --> E[Login with Email/Password]
    D --> F[Firebase Auth + Firestore userType]
    E --> F
    F --> G{User Type?}
    G -- Student --> H[Student Dashboard]
    G -- Worker --> I[Worker Dashboard]
    G -- Admin --> J[Admin Dashboard]
    H --> K[Access MongoDB Data]
    I --> K
    J --> K
    K --> L[Notices, Complaints, Cleaning, Equipment]
    L --> M[Logout]
    M --> B
```

## Dashboard Access

### Student Dashboard
- View notices (read-only)
- View own room cleaning status
- Add & view own complaints
- View equipment availability

### Worker Dashboard
- Add notices
- View & update all cleaning statuses
- View & update complaint statuses
- View equipment

### Admin Dashboard
- Full control over notices (add/edit/delete)
- Full control over cleaning schedules
- Full control over complaints
- Full control over equipment

## API Endpoints

### Notices
- `GET /api/notices` - Get all notices
- `POST /api/notices` - Create notice
- `PUT /api/notices/:id` - Update notice
- `DELETE /api/notices/:id` - Delete notice

### Complaints
- `GET /api/complaints?userId=X&userType=Y` - Get complaints
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id` - Update complaint

### Cleaning
- `GET /api/cleaning?roomNumber=X&userType=Y` - Get schedule
- `POST /api/cleaning` - Create schedule
- `PUT /api/cleaning/:id` - Update status

### Equipment
- `GET /api/equipment` - Get all equipment
- `POST /api/equipment` - Create equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment

## Troubleshooting

**Backend won't start:**
- Check if MongoDB is running: `mongosh` or `mongo`
- Check port 5000 is not in use: `lsof -ti:5000`

**Frontend shows "Loading forever":**
- Ensure backend is running on port 5000
- Check browser console for API errors
- Verify MongoDB has sample data

**Can't login:**
- Ensure Firebase Authentication is enabled
- Check Firebase config in `firebase.js`
- User must signup first to create account

## Project Structure
```
├── backend/
│   ├── config/        # Database configuration
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   └── server.js      # Express server
├── src/
│   ├── components/    # React components
│   ├── services/      # API service layer
│   ├── App.jsx        # Main app component
│   └── Login.jsx      # Login/Signup form
└── firebase.js        # Firebase config (auth only)
```

## Technology Stack
- **Frontend**: React 19, Vite, CSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB, Mongoose
- **Authentication**: Firebase Auth
- **User Storage**: Firebase Firestore (userType only)
