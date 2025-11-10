# How to Run the Hostel Management System - Complete Guide

This guide will walk you through every step needed to get the Hostel Management System running on your machine.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Install MongoDB](#step-1-install-mongodb)
3. [Step 2: Setup Project](#step-2-setup-project)
4. [Step 3: Configure Environment](#step-3-configure-environment)
5. [Step 4: Install Dependencies](#step-4-install-dependencies)
6. [Step 5: Setup Database](#step-5-setup-database)
7. [Step 6: Run the Application](#step-6-run-the-application)
8. [Step 7: Create Your Account](#step-7-create-your-account)
9. [Troubleshooting](#troubleshooting)
10. [Common Commands](#common-commands)

---

## Prerequisites

Before you begin, make sure you have these installed:

### Required:
- **Node.js** (v16 or higher)
  - Check: `node --version`
  - Download: https://nodejs.org/

- **npm** (comes with Node.js)
  - Check: `npm --version`

### Will Install:
- MongoDB (we'll install this in Step 1)

---

## Step 1: Install MongoDB

MongoDB is the database where we'll store all application data (notices, complaints, cleaning schedules, equipment).

### Option A: Local MongoDB (Recommended for Development)

#### **Ubuntu/Debian Linux:**
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

#### **macOS:**
```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb-community@7.0

# Verify it's running
brew services list
```

#### **Windows:**
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer (.msi file)
3. Choose "Complete" installation
4. Install MongoDB as a Service
5. MongoDB Compass (GUI) will also be installed

### Option B: MongoDB Atlas (Cloud - No Local Installation)

If you prefer a cloud database:

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a **FREE** M0 cluster (512MB storage)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. Save this - you'll need it in Step 3

#### Verify MongoDB Installation:

For **local MongoDB**, open a new terminal and type:
```bash
mongosh
# or on older versions:
mongo
```

You should see MongoDB shell. Type `exit` to quit.

---

## Step 2: Setup Project

### 2.1: Navigate to Project Directory
```bash
cd /run/media/harshal/Windows/work/projects/Hostel_Management
```

### 2.2: Check Project Structure

Your project should look like this:
```
Hostel_Management/
├── backend/           # Backend server
├── src/              # Frontend React app
├── firebase.js       # Firebase config
├── package.json      # Frontend dependencies
├── setup.sh          # Setup script
└── README.md         # Documentation
```

---

## Step 3: Configure Environment

### 3.1: Setup Backend Environment

Navigate to backend folder:
```bash
cd backend
```

Create `.env` file:
```bash
# Create .env file from template
cp .env.example .env
```

Edit the `.env` file:
```bash
# Use your preferred editor (nano, vim, or VS Code)
nano .env
```

Add these values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel_management
```

**If using MongoDB Atlas** (cloud), replace with your connection string:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hostel_management?retryWrites=true&w=majority
```

Save and close the file (`Ctrl+X`, then `Y`, then `Enter` in nano).

### 3.2: Setup Frontend Environment

Go back to project root:
```bash
cd ..
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit the `.env` file:
```bash
nano .env
```

Add this value:
```env
VITE_API_URL=http://localhost:5000/api
VITE_ENABLE_INITIAL_AUTH=false
```

Save and close the file.

---

## Step 4: Install Dependencies

### 4.1: Install Frontend Dependencies

From the project root directory:
```bash
npm install
```

This will install:
- React
- Vite
- Firebase
- All other frontend dependencies

**Wait for it to complete** (may take 1-3 minutes).

### 4.2: Install Backend Dependencies

Navigate to backend:
```bash
cd backend
```

Install backend dependencies:
```bash
npm install
```

This will install:
- Express (web server)
- Mongoose (MongoDB driver)
- CORS (cross-origin requests)
- dotenv (environment variables)
- nodemon (auto-restart server)

**Wait for it to complete** (may take 1-2 minutes).

Go back to project root:
```bash
cd ..
```

---

## Step 5: Setup Database

### 5.1: Verify MongoDB is Running

**For local MongoDB:**
```bash
# Check if MongoDB service is running
sudo systemctl status mongod

# If not running, start it:
sudo systemctl start mongod
```

**For MongoDB Atlas:**
- Make sure your IP address is whitelisted in Atlas
- Network Access → Add IP Address → Add Current IP Address

### 5.2: Add Sample Data

Navigate to backend:
```bash
cd backend
```

Run the seed script to populate MongoDB with sample data:
```bash
npm run seed
```

You should see output like:
```
✅ MongoDB Connected
🗑️  Cleared existing data
✅ Added 4 notices
✅ Added 6 equipment items
✅ Added 8 cleaning schedules

🎉 Sample data added successfully!
```

This adds:
- **4 notices** (announcements)
- **6 equipment items** (TT rackets, badminton, etc.)
- **8 cleaning schedules** (for different rooms)

Go back to project root:
```bash
cd ..
```

---

## Step 6: Run the Application

You have **3 options** to run the application:

### Option 1: Run Both Servers Together (Easiest)

From project root:
```bash
npm run start:all
```

This will start both frontend and backend in one terminal.

### Option 2: Run Separately (Recommended for Development)

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 5000
✅ MongoDB Connected: localhost
```

Keep this terminal running.

**Terminal 2 - Frontend Server:**

Open a new terminal, navigate to project root:
```bash
cd /run/media/harshal/Windows/work/projects/Hostel_Management
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Keep both terminals running.

### Option 3: Use the Setup Script

From project root:
```bash
./setup.sh
```

Then run:
```bash
npm run start:all
```

---

## Step 7: Create Your Account

### 7.1: Open the Application

Open your web browser and go to:
```
http://localhost:5173
```

You should see the **Login/Signup** page. If the screen is blank check the browser console for Firebase auth errors. Ensure `VITE_ENABLE_INITIAL_AUTH=false` unless you have enabled Anonymous Auth in Firebase.

### 7.2: Create Account (First Time)

1. **Click the "Sign Up" tab**

2. **Select User Type:**
   - **Student** - For regular students (can submit complaints, view own room)
   - **Worker** - For hostel staff (can update cleaning, resolve complaints)
   - **Admin** - Full access (manage everything)
   
   **Tip:** Start with **Admin** to test all features!

3. **Enter Email and Password:**
   - Email: `admin@hostel.com` (or any email)
   - Password: At least 6 characters (e.g., `admin123`)

4. **Click "Create account"**

5. **Wait for Firebase** to create your account (2-3 seconds). Your role (`userType`) is now persisted in MongoDB and used for dashboard selection.

### 7.3: Login

After signup, you'll be automatically logged in. For future logins:

1. Enter your email and password
2. Click "Sign in"
3. You'll be redirected to your dashboard based on your user type (MongoDB is the source of truth). If the role doesn't load, refresh; the app auto-upserts a missing profile.

---

## 🎉 Success! You're Now Running the Application

You should see:

### **Admin Dashboard** (if you selected Admin):
- 🔔 Notice Board (can add/delete)
- 🧹 All Rooms Cleaning Status (can update)
- 💬 All Complaints (can update status)
- 📦 Equipment Availability (can add/edit)

### **Worker Dashboard** (if you selected Worker):
- 🔔 Notice Board (can add)
- 🧹 All Rooms Cleaning Status (can update)
- 💬 All Complaints (can update status)
- 📦 Equipment Availability (read-only)

### **Student Dashboard** (if you selected Student):
- 🔔 Notice Board (read-only)
- 🧹 My Room Cleaning Status
- 💬 My Complaints (can add new)
- 📦 Equipment Availability (read-only)

---

## Troubleshooting

### Problem 1: Backend won't start

**Error: "Cannot connect to MongoDB"**

**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# If stopped, start it
sudo systemctl start mongod

# Verify connection
mongosh
```

---

### Problem 2: Port already in use

**Error: "Port 5000 already in use"**

**Solution:**
```bash
# Find what's using port 5000
lsof -ti:5000

# Kill that process
lsof -ti:5000 | xargs kill -9

# Then restart backend
cd backend && npm run dev
```

---

### Problem 3: Frontend shows "Loading..." forever

**Symptoms:** Dashboard just shows "Loading..." and never loads data

**Solutions:**

**Check 1: Is backend running?**
```bash
# Test backend API
curl http://localhost:5000/api/health

# Should return: {"status":"OK","message":"Server is running"}
```

**Check 2: Is MongoDB empty?**
```bash
cd backend
npm run seed
```

**Check 3: Check browser console**
1. Press F12 to open Developer Tools
2. Go to "Console" tab
3. Look for errors (red text)
4. Common error: "Failed to fetch" means backend is not running

---

### Problem 4: Can't create account

**Error: "Firebase: Error (auth/...)"**

**Solution:**

1. Go to https://console.firebase.google.com
2. Select your project: `hostelmanegement07`
3. Click **Authentication** in left menu
4. Click **Get Started** (if not set up)
5. Click **Sign-in method** tab
6. Click **Email/Password**
7. Enable both toggles
8. Click **Save**

Also enable Firestore:
1. Click **Firestore Database** in left menu
2. Click **Create database**
3. Start in **test mode**
4. Choose your region
5. Click **Enable**

---

### Problem 5: MongoDB Connection String Issues (Atlas)

**Error: "MongooseError: Operation `users.find()` buffering timed out"**

**Solutions:**

1. **Whitelist your IP:**
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Click "Add Current IP Address"
   - Click "Confirm"

2. **Check username/password:**
   - Make sure special characters in password are URL-encoded
   - Example: `p@ssword` should be `p%40ssword`

3. **Check connection string:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/hostel_management?retryWrites=true&w=majority
   ```

---

### Problem 6: "Module not found" errors

**Error: Various "Cannot find module" errors**

**Solution:**
```bash
# Reinstall all dependencies

# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

---

### Problem 7: Firebase config error

**Error: "Firebase configuration error"**

**Solution:**

Your Firebase config is in `firebase.js`. It should look like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDuTgcS8zNMm-5PZNirSnLV3Cb9PJZ_SHg",
  authDomain: "hostelmanegement07.firebaseapp.com",
  projectId: "hostelmanegement07",
  // ... other config
};
```

If you see `__firebase_config` errors, the config is fine. Just make sure Firebase Authentication is enabled.

---

## Common Commands Reference

### Start/Stop Services

```bash
# Start MongoDB (Ubuntu/Debian)
sudo systemctl start mongod

# Stop MongoDB
sudo systemctl stop mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB (macOS)
brew services start mongodb-community@7.0

# Stop MongoDB (macOS)
brew services stop mongodb-community@7.0
```

### Development Commands

```bash
# Install all dependencies
npm install
cd backend && npm install && cd ..

# Run both servers together
npm run start:all

# Run backend only
cd backend && npm run dev

# Run frontend only
npm run dev

# Add sample data to MongoDB
cd backend && npm run seed

# Build frontend for production
npm run build
```

### Database Commands

```bash
# Open MongoDB shell
mongosh

# Show all databases
show dbs

# Use hostel_management database
use hostel_management

# Show all collections
show collections

# View notices
db.notices.find()

# View equipment
db.equipment.find()

# Count documents
db.notices.countDocuments()

# Delete all data
db.notices.deleteMany({})
db.equipment.deleteMany({})
db.cleaningSchedule.deleteMany({})
db.complaints.deleteMany({})

# Exit MongoDB shell
exit
```

### Testing API Endpoints

```bash
# Health check
curl http://localhost:5000/api/health

# Get all notices
curl http://localhost:5000/api/notices

# Get all equipment
curl http://localhost:5000/api/equipment

# Add a notice (POST request)
curl -X POST http://localhost:5000/api/notices \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Testing API","priority":"medium","date":"Nov 9, 2025"}'
```

---

## Development Workflow

### Daily Development Routine

1. **Start MongoDB:**
   ```bash
   sudo systemctl start mongod
   ```

2. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Leave this running in Terminal 1

3. **Start Frontend:**
   ```bash
   # New terminal
   npm run dev
   ```
   Leave this running in Terminal 2

4. **Make changes** to code (changes auto-reload)

5. **View logs** in your terminals for errors

### When You're Done

1. Stop frontend: `Ctrl+C` in Terminal 2
2. Stop backend: `Ctrl+C` in Terminal 1
3. Optionally stop MongoDB:
   ```bash
   sudo systemctl stop mongod
   ```

---

## Next Steps

### After Getting It Running:

1. **Explore the dashboards:**
   - Create accounts with different user types
   - Test adding notices, complaints, etc.

2. **View MongoDB data:**
   - Install MongoDB Compass (GUI): https://www.mongodb.com/products/compass
   - Connect to `mongodb://localhost:27017`
   - Browse `hostel_management` database

3. **Customize the app:**
   - Edit components in `src/components/`
   - Modify styles in CSS files
   - Add new features in backend routes

4. **Deploy to production:**
   - See README.md for deployment guides
   - Use MongoDB Atlas for database
   - Use Vercel/Netlify for frontend
   - Use Railway/Render for backend

---

## Quick Reference Card

### Ports Used:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **MongoDB**: localhost:27017

### User Types:
- **student** - Limited access
- **worker** - Moderate access
- **admin** - Full access

### Important Files:
- `backend/.env` - Backend configuration
- `.env` - Frontend configuration
- `backend/seed.js` - Sample data script
- `firebase.js` - Firebase config

### Getting Help:
- Check browser console (F12)
- Check terminal logs (backend/frontend)
- See ARCHITECTURE.md for system design
- See README.md for API documentation

---

## Support

If you're still having issues:

1. **Check all logs:**
   - Browser console (F12)
   - Backend terminal
   - Frontend terminal

2. **Verify all services:**
   - MongoDB: `sudo systemctl status mongod`
   - Backend: `curl http://localhost:5000/api/health`
   - Frontend: Open http://localhost:5173

3. **Fresh start:**
   ```bash
   # Kill all Node processes
   killall node
   
   # Kill port 5000
   lsof -ti:5000 | xargs kill -9
   
   # Restart MongoDB
   sudo systemctl restart mongod
   
   # Reinstall dependencies
   rm -rf node_modules backend/node_modules
   npm install
   cd backend && npm install && cd ..
   
   # Start fresh
   npm run start:all
   ```

---

**You're all set! Happy coding! 🚀**
