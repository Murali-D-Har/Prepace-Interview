const router = require('express').Router();
const Question = require('../models/Question');
const { protect, adminOnly } = require('../middleware/auth');

// ── GET /api/questions ────────────────────────────────────────────────────────
// Query params: category, difficulty, tags, limit, page
router.get('/', protect, async (req, res) => {
  try {
    const { category, difficulty, tags, limit = 10, page = 1 } = req.query;
    const filter = { isActive: true };

    if (category)   filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (tags)       filter.tags = { $in: tags.split(',') };

    const skip  = (page - 1) * limit;
    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter).skip(skip).limit(Number(limit));

    res.json({ questions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/questions/daily ──────────────────────────────────────────────────
// Returns today's "question of the day" (deterministic per day)
router.get('/daily', protect, async (req, res) => {
  try {
    const dayOfYear = Math.floor(
      (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );
    const total = await Question.countDocuments({ isActive: true });
    const index = dayOfYear % total;
    const question = await Question.findOne({ isActive: true }).skip(index);
    res.json({ question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/questions/random ─────────────────────────────────────────────────
// Returns N random questions for a session
router.get('/random', protect, async (req, res) => {
  try {
    const { count = 5, category, difficulty } = req.query;
    const filter = { isActive: true };
    if (category)   filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: Number(count) } },
    ]);
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/questions/:id ────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/questions ───────────────────────────────────────────────────────
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ question });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── PUT /api/questions/:id ────────────────────────────────────────────────────
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ question });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE /api/questions/:id ─────────────────────────────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Question.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Question deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/questions/bulk ──────────────────────────────────────────────────
router.post('/bulk', protect, adminOnly, async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions)) return res.status(400).json({ error: 'questions must be array' });
    const inserted = await Question.insertMany(questions);
    res.status(201).json({ inserted: inserted.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;