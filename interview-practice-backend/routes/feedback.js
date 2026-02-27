const router = require('express').Router();
const Answer   = require('../models/Answer');
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');
const { generateFeedback } = require('../services/aiFeedback');

// ── GET /api/feedback/:answerId ───────────────────────────────────────────────
// Get full feedback + reveal sample answer for a completed answer
router.get('/:answerId', protect, async (req, res) => {
  try {
    const answer = await Answer.findOne({ _id: req.params.answerId, user: req.user._id })
      .populate('question');
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    res.json({
      aiFeedback:   answer.aiFeedback,
      sampleAnswer: answer.question.sampleAnswer,
      timeTaken:    answer.timeTaken,
      timeLimit:    answer.timeLimit,
      timedOut:     answer.timedOut,
      question:     { text: answer.question.text, category: answer.question.category },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/feedback/:answerId/regenerate ───────────────────────────────────
// Re-generate AI feedback (useful if initial generation failed)
router.post('/:answerId/regenerate', protect, async (req, res) => {
  try {
    const answer = await Answer.findOne({ _id: req.params.answerId, user: req.user._id })
      .populate('question');
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    const aiFeedback = await generateFeedback(
      answer.question.text,
      answer.answerText,
      answer.question.category
    );

    answer.aiFeedback = aiFeedback;
    await answer.save();

    res.json({ aiFeedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;