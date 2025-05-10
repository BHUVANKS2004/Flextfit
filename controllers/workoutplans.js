const express = require('express');
const router = express.Router();

// Create Workout Plan

router.post('/api/workout-plans', authMiddleware, async (req, res) => {
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
router.get('/api/workout-plans', authMiddleware, async (req, res) => {
  try {
    const plans = await WorkoutPlan.find({ userId: req.user._id });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update Workout Plan
router.put('/api/workout-plans/:id', authMiddleware, async (req, res) => {
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
router.delete('/api/workout-plans/:id', authMiddleware, async (req, res) => {
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

module.exports = router;

