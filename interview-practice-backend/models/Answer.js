const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    session:  { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },

    // The user's answer (text or transcript from speech)
    answerText:   { type: String, default: '' },
    answerSource: { type: String, enum: ['text', 'voice'], default: 'text' },

    // Time tracking
    timeTaken:   { type: Number, default: 0 }, // seconds
    timeLimit:   { type: Number, default: 120 },
    timedOut:    { type: Boolean, default: false },

    // AI Feedback
    aiFeedback: {
      score:        { type: Number, min: 0, max: 10 },
      strengths:    { type: [String], default: [] },
      improvements: { type: [String], default: [] },
      summary:      { type: String, default: '' },
      keywords:     { type: [String], default: [] }, // matched keywords
    },

    // User self-rating
    selfRating: { type: Number, min: 1, max: 5 },

    // Bookmarked for review
    bookmarked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

answerSchema.index({ user: 1, question: 1 });
answerSchema.index({ session: 1 });
answerSchema.index({ bookmarked: 1, user: 1 });

module.exports = mongoose.model('Answer', answerSchema);