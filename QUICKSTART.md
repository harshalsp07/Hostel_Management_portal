# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install MongoDB
Choose one option:

**Option A - Local (Recommended for Development)**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongod

# macOS
brew install mongodb-community
brew services start mongodb-community
```

**Option B - MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster
3. Get your connection string
4. Update `backend/.env` with your connection string

### Step 2: Run Setup Script
```bash
chmod +x setup.sh
./setup.sh
```

This will install all dependencies for both frontend and backend.

### Step 3: Add Sample Data
```bash
cd backend
npm run seed
```

This populates MongoDB with:
- 4 sample notices
- 6 equipment items  
- 8 room cleaning schedules

### Step 4: Start the Application

**Option A - Run Both Servers Together:**
```bash
npm run start:all
```

**Option B - Run Separately (Recommended for Development):**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend (from project root):
```bash
npm run dev
```

### Step 5: Create Your Account
1. Open http://localhost:5173
2. Click "Sign Up"
3. Select your user type (Student/Worker/Admin)
4. Enter email and password
5. Click "Create account"

### Step 6: Login and Explore!
- Login with your email and password
- User type is automatically loaded from Firebase
- Explore features based on your role

---

## 🎯 What Works Now

### ✅ Firebase (Authentication Only)
- User registration
- User login/logout
- User type storage (student/worker/admin)

### ✅ MongoDB (All Data)
- Notices (announcements)
- Complaints (issue tracking)
- Cleaning schedules (room maintenance)
- Equipment (inventory management)

---

## 🐛 Troubleshooting

### Backend won't start
**Error: "Cannot connect to MongoDB"**
```bash
# Check if MongoDB is running
mongosh
# or
mongo

# If not running, start it
sudo systemctl start mongod
```

**Error: "Port 5000 already in use"**
```bash
# Kill the process using port 5000
lsof -ti:5000 | xargs kill -9
```

### Frontend shows "Loading forever"
**Solution:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Common issues:
   - Backend not running → Start backend server
   - Wrong API URL → Check `.env` has `VITE_API_URL=http://localhost:5000/api`
   - MongoDB empty → Run `npm run seed` in backend folder

### Can't create account
**Error: "Firebase: Error (auth/...)"**
1. Go to https://console.firebase.google.com
2. Select project: `hostelmanegement07`
3. Click Authentication → Sign-in method
4. Enable Email/Password
5. Also enable Firestore Database

---

## 📂 Project Structure
```
Hostel_Management/
├── backend/              # Express + MongoDB server
│   ├── config/          # Database connection
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── server.js        # Main server file
│   ├── seed.js          # Sample data script
│   └── package.json     # Backend dependencies
├── src/                 # React frontend
│   ├── components/      # UI components
│   ├── services/        # API calls
│   ├── App.jsx         # Main app
│   └── Login.jsx       # Login/Signup
├── firebase.js         # Firebase config (auth only)
└── package.json        # Frontend dependencies
```

---

## 🔑 Key Concepts

### User Types
1. **Student** - Can view data, submit complaints
2. **Worker** - Can add notices, update cleaning status, resolve complaints
3. **Admin** - Full control over everything

### Data Flow
```
User Login (Firebase) → Get UserType (Firestore) → Load Data (MongoDB)
```

---

## 📝 Common Commands

```bash
# Install dependencies
npm install
cd backend && npm install

# Start both servers
npm run start:all

# Start backend only
cd backend && npm run dev

# Start frontend only
npm run dev

# Add sample data
cd backend && npm run seed

# Check if MongoDB is running
mongosh

# View backend logs
cd backend && npm run dev
```

---

## 🎓 Next Steps

1. **Customize** - Edit components in `src/components/`
2. **Add Features** - Create new models in `backend/models/`
3. **Style** - Update CSS in component files
4. **Deploy** - Use MongoDB Atlas + Vercel/Netlify

---

## 💡 Tips

- Use MongoDB Compass GUI to view your database visually
- Check browser console (F12) for frontend errors
- Check terminal for backend errors
- Keep both terminals open to see real-time logs
- User type is set ONCE during signup, then stored in Firebase

---

## 🆘 Need Help?

Check the detailed README.md for:
- Full API documentation
- Security best practices
- Deployment guides
- Advanced troubleshooting
