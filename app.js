const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const loginRoutes = require('./controllers/loginuser');
const workoutplanRoutes = require('./controllers/workoutplans');

const User=require('./models/users')
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.use(loginRoutes);
app.use(workoutplanRoutes);

// MongoDB Connection
mongoose.connect('mongodb://localhost/Flexfit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Schemas


const workoutPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planName: { type: String, required: true },
  type: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
    duration: Number, // in minutes
    day: String
  }],
  createdAt: { type: Date, default: Date.now }
});

// Models
const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
// Register User


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});