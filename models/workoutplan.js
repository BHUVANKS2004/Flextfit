const mongoose=require('mongoose');
const User=require('./users')

const workoutPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planName: { type: String, required: true },
  type: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
    duration: Number,
    day: String
  }],
  createdAt: { type: Date, default: Date.now }
});

exports.module=mongoose.model('WorkoutPlan', workoutPlanSchema);
