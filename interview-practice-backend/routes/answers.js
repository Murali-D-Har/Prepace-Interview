const router = require('express').Router();
const Answer   = require('../models/Answer');
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');
const { generateFeedback } = require('../services/aiFeedback');

// ── POST /api/answers ─────────────────────────────────────────────────────────
// Submit an answer — triggers AI feedback generation
router.post('/', protect, async (req, res) => {
  try {
    const { sessionId, questionId, answerText, answerSource, timeTaken, timeLimit, timedOut } = req.body;

    if (!sessionId || !questionId)
      return res.status(400).json({ error: 'sessionId and questionId are required' });

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    // Generate AI feedback
    const aiFeedback = await generateFeedback(question.text, answerText, question.category);

    const answer = await Answer.create({
      user: req.user._id,
      session: sessionId,
      question: questionId,
      answerText,
      answerSource: answerSource || 'text',
      timeTaken,
      timeLimit,
      timedOut: timedOut || false,
      aiFeedback,
    });

    // Update question stats
    const allAnswers = await Answer.find({ question: questionId });
    const avgScore   = allAnswers.reduce((s, a) => s + (a.aiFeedback?.score || 0), 0) / allAnswers.length;
    await Question.findByIdAndUpdate(questionId, {
      timesAttempted: allAnswers.length,
      averageScore: parseFloat(avgScore.toFixed(2)),
    });

    res.status(201).json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/answers ──────────────────────────────────────────────────────────
// All answers for logged-in user (optionally filter by question)
router.get('/', protect, async (req, res) => {
  try {
    const { questionId, bookmarked, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };

    if (questionId)               filter.question = questionId;
    if (bookmarked === 'true')    filter.bookmarked = true;

    const skip    = (page - 1) * limit;
    const total   = await Answer.countDocuments(filter);
    const answers = await Answer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('question', 'text category difficulty');

    res.json({ answers, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/answers/:id ──────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const answer = await Answer.findOne({ _id: req.params.id, user: req.user._id })
      .populate('question');
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/answers/:id/bookmark ──────────────────────────────────────────
router.patch('/:id/bookmark', protect, async (req, res) => {
  try {
    const answer = await Answer.findOne({ _id: req.params.id, user: req.user._id });
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    answer.bookmarked = !answer.bookmarked;
    await answer.save();
    res.json({ bookmarked: answer.bookmarked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/answers/:id/self-rating ───────────────────────────────────────
router.patch('/:id/self-rating', protect, async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });

    const answer = await Answer.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { selfRating: rating },
      { new: true }
    );
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;