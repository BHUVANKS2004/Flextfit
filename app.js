const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost/flexfit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

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
const User = mongoose.model('User', userSchema);
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
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: user._id, email, name } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Login User
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, email, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create Workout Plan
app.post('/api/workout-plans', authMiddleware, async (req, res) => {
  try {
    const { planName, type, exercises } = req.body;
    
    if (!planName || !type || !exercises) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const workoutPlan = new WorkoutPlan({
      userId: req.user._id,
      planName,
      type,
      exercises
    });

    await workoutPlan.save();
    res.status(201).json(workoutPlan);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get User's Workout Plans
app.get('/api/workout-plans', authMiddleware, async (req, res) => {
  try {
    const plans = await WorkoutPlan.find({ userId: req.user._id });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update Workout Plan
app.put('/api/workout-plans/:id', authMiddleware, async (req, res) => {
  try {
    const { planName, type, exercises } = req.body;
    const plan = await WorkoutPlan.findOne({ _id: req.params.id, userId: req.user._id });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    plan.planName = planName || plan.planName;
    plan.type = type || plan.type;
    plan.exercises = exercises || plan.exercises;

    await plan.save();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete Workout Plan
app.delete('/api/workout-plans/:id', authMiddleware, async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});