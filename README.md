# Hostel Management System

A complete hostel management system with role-based dashboards using **MongoDB** for data storage and **Firebase** for authentication.

## Architecture
- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB (for notices, complaints, cleaning, equipment, userType)
- **Authentication**: Firebase (for user auth)

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

### 2. Setup Backend
```bash

# Edit .env and add your MongoDB URI
# For local: mongodb://localhost:27017/hostel_management
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/hostel_management
```

### 3. Setup Frontend
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### 4. Add Sample Data to MongoDB

**Start the backend server first:**
```bash
cd backend
npm run dev
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

## User Flow

```mermaid
flowchart TD
    A[Open Website] --> B[See Login/Signup Screen]
    B --> C{New User?}
    C -- Yes --> D[Sign Up with User Type]
    C -- No --> E[Login with Email/Password]
    D --> F[Firebase Auth + MongoDB userType]
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
- **User Storage**: Mongoose (userType)
