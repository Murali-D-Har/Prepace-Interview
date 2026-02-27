const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text:       { type: String, required: true },
    category:   {
      type: String,
      required: true,
      enum: ['behavioral', 'technical', 'hr', 'situational', 'leadership', 'problem-solving'],
    },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags:       { type: [String], default: [] },

    // Sample answer hint (not shown until user submits)
    sampleAnswer: { type: String, default: '' },

    // Suggested time limit in seconds
    timeLimit: { type: Number, default: 120 },

    // Usage stats
    timesAttempted: { type: Number, default: 0 },
    averageScore:   { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

questionSchema.index({ category: 1, difficulty: 1 });
questionSchema.index({ tags: 1 });

module.exports = mongoose.model('Question', questionSchema);