require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

const questions = [
  // ── Behavioral ────────────────────────────────────────────────────────────
  { text: 'Tell me about a time you faced a major challenge at work. How did you handle it?', category: 'behavioral', difficulty: 'medium', timeLimit: 120, tags: ['challenge', 'problem-solving'], sampleAnswer: 'Use the STAR method: Situation, Task, Action, Result. Describe a specific challenge, what your role was, the steps you took, and the measurable outcome.' },
  { text: 'Describe a situation where you had to work with a difficult team member.', category: 'behavioral', difficulty: 'medium', timeLimit: 120, tags: ['teamwork', 'conflict'] },
  { text: 'Give an example of a goal you set and how you achieved it.', category: 'behavioral', difficulty: 'easy', timeLimit: 90, tags: ['goals', 'achievement'] },
  { text: 'Tell me about a time you failed. What did you learn?', category: 'behavioral', difficulty: 'medium', timeLimit: 120, tags: ['failure', 'growth'] },
  { text: 'Describe a time you had to make a decision with limited information.', category: 'behavioral', difficulty: 'hard', timeLimit: 150, tags: ['decision-making', 'ambiguity'] },

  // ── Technical ─────────────────────────────────────────────────────────────
  { text: 'Explain the difference between REST and GraphQL APIs.', category: 'technical', difficulty: 'medium', timeLimit: 120, tags: ['api', 'web'] },
  { text: 'What is the difference between SQL and NoSQL databases? When would you use each?', category: 'technical', difficulty: 'medium', timeLimit: 120, tags: ['database', 'sql'] },
  { text: 'Explain how you would design a URL shortening service like bit.ly.', category: 'technical', difficulty: 'hard', timeLimit: 180, tags: ['system-design', 'architecture'] },
  { text: 'What is the time complexity of binary search and why?', category: 'technical', difficulty: 'easy', timeLimit: 90, tags: ['algorithms', 'complexity'] },
  { text: 'How does garbage collection work in modern programming languages?', category: 'technical', difficulty: 'hard', timeLimit: 150, tags: ['memory', 'languages'] },

  // ── HR ────────────────────────────────────────────────────────────────────
  { text: 'Why do you want to work at this company?', category: 'hr', difficulty: 'easy', timeLimit: 90, tags: ['motivation', 'culture'] },
  { text: 'Where do you see yourself in 5 years?', category: 'hr', difficulty: 'easy', timeLimit: 90, tags: ['career', 'goals'] },
  { text: 'What is your greatest strength and your greatest weakness?', category: 'hr', difficulty: 'medium', timeLimit: 120, tags: ['self-awareness'] },
  { text: 'How do you handle stress and pressure?', category: 'hr', difficulty: 'medium', timeLimit: 90, tags: ['stress', 'wellbeing'] },
  { text: 'Why are you leaving your current role?', category: 'hr', difficulty: 'medium', timeLimit: 90, tags: ['transition', 'motivation'] },

  // ── Situational ───────────────────────────────────────────────────────────
  { text: 'If you were given a project with an unrealistic deadline, how would you handle it?', category: 'situational', difficulty: 'medium', timeLimit: 120, tags: ['deadline', 'planning'] },
  { text: 'Your manager gives you feedback you strongly disagree with. What do you do?', category: 'situational', difficulty: 'hard', timeLimit: 120, tags: ['feedback', 'conflict'] },
  { text: 'You discover a colleague has made a significant error. What do you do?', category: 'situational', difficulty: 'medium', timeLimit: 90, tags: ['error', 'teamwork'] },

  // ── Leadership ────────────────────────────────────────────────────────────
  { text: 'Tell me about a time you led a team through a difficult project.', category: 'leadership', difficulty: 'hard', timeLimit: 150, tags: ['leadership', 'team'] },
  { text: 'How do you motivate a team member who is underperforming?', category: 'leadership', difficulty: 'hard', timeLimit: 150, tags: ['motivation', 'management'] },

  // ── Problem Solving ───────────────────────────────────────────────────────
  { text: 'How many gas stations are there in the United States?', category: 'problem-solving', difficulty: 'hard', timeLimit: 180, tags: ['estimation', 'fermi'] },
  { text: 'Walk me through how you would debug a production issue affecting 10% of users.', category: 'problem-solving', difficulty: 'hard', timeLimit: 180, tags: ['debugging', 'production'] },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Question.deleteMany({});
  await Question.insertMany(questions);
  console.log(`✅ Seeded ${questions.length} questions`);
  process.exit();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});