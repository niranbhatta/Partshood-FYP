# Partshood - Motorcycle Spare Parts Marketplace

This is a complete MERN-stack application featuring a modern marketplace and an interactive seller dashboard.

## Prerequisites
- **Node.js**: Ensure you have Node.js installed (v16+ recommended).
- **MongoDB**: Ensure MongoDB is installed and running locally on standard port `27017`.

## Getting Started

### 1. Setup the Backend
Open a terminal and navigate to the `backend` directory:
```bash
cd backend
npm install
```

Make sure you have an `.env` file in the `backend` directory. (This should already exist with `PORT=5000`, your local `MONGO_URI`, and `JWT_SECRET`).

**Seed the Database (Optional but recommended):**
To populate the database with mock users and motorcycle parts, run:
```bash
node seed.js
```

**Start the Backend Server:**
```bash
node server.js
```
The backend API will start running on `http://localhost:5000`.

### 2. Setup the Frontend
Open a new terminal window and navigate to the `frontend` directory:
```bash
cd frontend
npm install
```

**Start the Frontend Server:**
```bash
npm run dev
```
The Vite development server will start on `http://localhost:5173`. 

### 3. Usage
Open your browser and navigate to `http://localhost:5173/` to see the running application!
