const router = require('express').Router();
const Answer = require('../models/Answer');
const User   = require('../models/User');
const { protect } = require('../middleware/auth');

// ── GET /api/leaderboard ──────────────────────────────────────────────────────
// Top users by average score (this week)
router.get('/', protect, async (req, res) => {
  try {
    const { period = 'week' } = req.query;

    const dateFilter = new Date();
    if (period === 'week')  dateFilter.setDate(dateFilter.getDate() - 7);
    if (period === 'month') dateFilter.setDate(dateFilter.getDate() - 30);
    if (period === 'all')   dateFilter.setFullYear(2000);

    const board = await Answer.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      {
        $group: {
          _id:      '$user',
          avgScore: { $avg: '$aiFeedback.score' },
          count:    { $sum: 1 },
        },
      },
      { $match: { count: { $gte: 3 } } }, // min 3 answers to qualify
      { $sort: { avgScore: -1 } },
      { $limit: 10 },
    ]);

    // Hydrate user names
    const userIds = board.map((b) => b._id);
    const users   = await User.find({ _id: { $in: userIds } }).select('name avatar currentStreak');
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    const result = board.map((entry, idx) => ({
      rank:     idx + 1,
      user:     userMap[entry._id.toString()],
      avgScore: parseFloat(entry.avgScore.toFixed(2)),
      count:    entry.count,
    }));

    res.json({ leaderboard: result, period });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/leaderboard/streaks ──────────────────────────────────────────────
// Top users by streak
router.get('/streaks', protect, async (req, res) => {
  try {
    const users = await User.find({ currentStreak: { $gt: 0 } })
      .sort({ currentStreak: -1 })
      .limit(10)
      .select('name avatar currentStreak longestStreak');

    res.json({ leaderboard: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;