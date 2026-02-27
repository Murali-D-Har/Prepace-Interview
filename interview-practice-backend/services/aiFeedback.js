require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateFeedback = async (questionText, answerText, category) => {
  console.log('🤖 generateFeedback called');
  console.log('   GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);

  if (!process.env.GROQ_API_KEY) {
    console.log('⚠️  No Groq key found — returning mock feedback');
    return mockFeedback(answerText);
  }

  try {
    console.log('📡 Calling Groq API...');

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert interview coach. Analyze this ${category} interview answer.
Return ONLY a raw JSON object — no markdown, no backticks, no explanation:
{
  "score": <number 0-10>,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "summary": "<2-3 sentence honest evaluation>",
  "keywords": ["keyword1", "keyword2"]
}`
        },
        {
          role: 'user',
          content: `Question: ${questionText}\n\nAnswer: ${answerText || '[No answer — timed out]'}`
        }
      ],
      temperature: 0.4,
      max_tokens: 500,
    });

    const raw     = response.choices[0].message.content.trim();
    console.log('✅ Groq raw response:', raw);

    const cleaned  = raw.replace(/```json|```/g, '').trim();
    const feedback = JSON.parse(cleaned);
    console.log('✅ Parsed. Score:', feedback.score);
    return feedback;

  } catch (err) {
    console.error('❌ Groq Error:', err.message);
    return mockFeedback(answerText);
  }
};

const mockFeedback = (answerText) => {
  const wordCount = answerText?.split(' ').length || 0;
  const score     = Math.min(10, Math.max(1, Math.floor(wordCount / 10)));
  return {
    score,
    strengths:    ['Attempted the question', 'Provided some context'],
    improvements: ['Add more specific examples', 'Use the STAR method'],
    summary:      'Mock feedback — Groq API not connected.',
    keywords:     ['example', 'situation', 'result'],
  };
};

module.exports = { generateFeedback };