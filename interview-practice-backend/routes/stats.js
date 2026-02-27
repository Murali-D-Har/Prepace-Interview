const router = require('express').Router();
const Answer  = require('../models/Answer');
const Session = require('../models/Session');
const { protect } = require('../middleware/auth');

// ── GET /api/stats/overview ───────────────────────────────────────────────────
router.get('/overview', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalAnswers, totalSessions, bookmarked] = await Promise.all([
      Answer.countDocuments({ user: userId }),
      Session.countDocuments({ user: userId, status: 'completed' }),
      Answer.countDocuments({ user: userId, bookmarked: true }),
    ]);

    const scoreAgg = await Answer.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, avgScore: { $avg: '$aiFeedback.score' } } },
    ]);

    const avgScore = scoreAgg[0]?.avgScore?.toFixed(2) || 0;

    res.json({
      totalAnswers,
      totalSessions,
      bookmarkedAnswers: bookmarked,
      averageScore: Number(avgScore),
      currentStreak: req.user.currentStreak,
      longestStreak: req.user.longestStreak,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/stats/by-category ────────────────────────────────────────────────
router.get('/by-category', protect, async (req, res) => {
  try {
    const breakdown = await Answer.aggregate([
      { $match: { user: req.user._id } },
      { $lookup: { from: 'questions', localField: 'question', foreignField: '_id', as: 'q' } },
      { $unwind: '$q' },
      {
        $group: {
          _id: '$q.category',
          count:    { $sum: 1 },
          avgScore: { $avg: '$aiFeedback.score' },
        },
      },
      { $sort: { count: -1 } },
    ]);
    res.json({ breakdown });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/stats/progress ───────────────────────────────────────────────────
// Daily score trend for the last 30 days
router.get('/progress', protect, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trend = await Answer.aggregate([
      { $match: { user: req.user._id, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          avgScore: { $avg: '$aiFeedback.score' },
          count:    { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ trend });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/stats/weak-areas ─────────────────────────────────────────────────
// Categories where the user's average score is below 6
router.get('/weak-areas', protect, async (req, res) => {
  try {
    const breakdown = await Answer.aggregate([
      { $match: { user: req.user._id } },
      { $lookup: { from: 'questions', localField: 'question', foreignField: '_id', as: 'q' } },
      { $unwind: '$q' },
      {
        $group: {
          _id: '$q.category',
          avgScore: { $avg: '$aiFeedback.score' },
          count:    { $sum: 1 },
        },
      },
      { $match: { avgScore: { $lt: 6 } } },
      { $sort: { avgScore: 1 } },
    ]);
    res.json({ weakAreas: breakdown });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;