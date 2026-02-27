const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ── POST /api/streak/check-in ─────────────────────────────────────────────────
// Called after the user completes at least one question for the day
router.post('/check-in', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now  = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Already checked in today?
    if (user.lastActiveDate) {
      const lastDate = new Date(
        user.lastActiveDate.getFullYear(),
        user.lastActiveDate.getMonth(),
        user.lastActiveDate.getDate()
      );
      if (lastDate.getTime() === today.getTime()) {
        return res.json({
          message: 'Already checked in today',
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
        });
      }

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate.getTime() === yesterday.getTime()) {
        // Consecutive day — extend streak
        user.currentStreak += 1;
      } else {
        // Streak broken
        user.currentStreak = 1;
      }
    } else {
      user.currentStreak = 1;
    }

    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }

    user.lastActiveDate = now;
    await user.save();

    res.json({
      message: 'Streak updated!',
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/streak ────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  res.json({
    currentStreak:  req.user.currentStreak,
    longestStreak:  req.user.longestStreak,
    lastActiveDate: req.user.lastActiveDate,
  });
});

module.exports = router;