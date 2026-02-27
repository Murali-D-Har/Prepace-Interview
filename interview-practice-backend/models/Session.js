const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mode:       { type: String, enum: ['timed', 'relaxed', 'mock'], default: 'timed' },
    categories: { type: [String], default: [] },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' },

    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],

    // Session result summary
    totalQuestions: { type: Number, default: 0 },
    answered:       { type: Number, default: 0 },
    averageScore:   { type: Number, default: 0 },
    totalTimeTaken: { type: Number, default: 0 }, // seconds

    status: { type: String, enum: ['in-progress', 'completed', 'abandoned'], default: 'in-progress' },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Session', sessionSchema);