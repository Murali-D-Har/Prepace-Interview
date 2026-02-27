const router = require('express').Router();
const Session = require('../models/Session');
const Answer  = require('../models/Answer');
const { protect } = require('../middleware/auth');

// ── POST /api/sessions ────────────────────────────────────────────────────────
// Create and start a new session
router.post('/', protect, async (req, res) => {
  try {
    const { mode, categories, difficulty, questions } = req.body;

    const session = await Session.create({
      user: req.user._id,
      mode,
      categories,
      difficulty,
      questions,
      totalQuestions: questions?.length || 0,
    });

    res.status(201).json({ session });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── GET /api/sessions ─────────────────────────────────────────────────────────
// Get user's session history
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const skip     = (page - 1) * limit;
    const total    = await Session.countDocuments(filter);
    const sessions = await Session.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('questions', 'text category difficulty');

    res.json({ sessions, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/sessions/:id ─────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, user: req.user._id })
      .populate('questions');
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const answers = await Answer.find({ session: session._id }).populate('question', 'text');
    res.json({ session, answers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/sessions/:id/complete ─────────────────────────────────────────
router.patch('/:id/complete', protect, async (req, res) => {
  try {
    const { totalTimeTaken } = req.body;
    const answers = await Answer.find({ session: req.params.id });

    const answered  = answers.length;
    const avgScore  = answered
      ? answers.reduce((sum, a) => sum + (a.aiFeedback?.score || 0), 0) / answered
      : 0;

    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        status: 'completed',
        answered,
        averageScore: parseFloat(avgScore.toFixed(2)),
        totalTimeTaken,
        completedAt: new Date(),
      },
      { new: true }
    );

    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/sessions/:id/abandon ──────────────────────────────────────────
router.patch('/:id/abandon', protect, async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'abandoned' },
      { new: true }
    );
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;