const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const DIFFICULTY_MAP = {
  easy: 'Ask straightforward, common interview questions. Be encouraging.',
  medium: 'Ask standard industry interview questions with some follow-ups. Be professional.',
  hard: 'Ask challenging, senior-level questions with tricky follow-ups. Probe deeply into answers. Be thorough.'
};

const INTERVIEW_TYPES = {
  behavioral: 'Focus on behavioral questions (STAR method). Ask about past experiences, teamwork, conflict resolution, leadership.',
  technical: 'Focus on technical knowledge, system design, problem-solving approaches, and domain expertise.',
  mixed: 'Mix behavioral and technical questions naturally, as a real interview would flow.'
};

function parseJSON(text) {
  try {
    return JSON.parse(text.trim());
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse AI response');
  }
}

async function generateQuestions(role, difficulty, interviewType, count = 5) {
  const result = await model.generateContent(`You are an expert interviewer for ${role} positions.

DIFFICULTY: ${difficulty} - ${DIFFICULTY_MAP[difficulty] || DIFFICULTY_MAP.medium}
TYPE: ${interviewType} - ${INTERVIEW_TYPES[interviewType] || INTERVIEW_TYPES.mixed}

Generate exactly ${count} interview questions. Return ONLY valid JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "<the interview question>",
      "category": "<behavioral|technical|situational>",
      "hint": "<a brief hint about what the interviewer is looking for>"
    }
  ]
}

Make questions realistic, varied, and appropriate for a ${role} role at ${difficulty} difficulty.
Return ONLY JSON, no markdown.`);

  return parseJSON(result.response.text());
}

async function evaluateAnswer(role, question, answer, difficulty) {
  const result = await model.generateContent(`You are an expert interviewer evaluating a candidate for a ${role} position.

QUESTION: ${question}
CANDIDATE'S ANSWER: ${answer}
DIFFICULTY LEVEL: ${difficulty}

Evaluate the answer and return ONLY valid JSON:
{
  "score": <1-10>,
  "feedback": "<2-3 sentences of specific feedback>",
  "strengths": ["<what they did well>"],
  "improvements": ["<specific suggestion 1>", "<specific suggestion 2>"],
  "sampleAnswer": "<A strong example answer for this question (2-3 sentences)>"
}

Be fair but honest. Score relative to ${difficulty} difficulty expectations.
Return ONLY JSON, no markdown.`);

  return parseJSON(result.response.text());
}

async function generateFinalReport(role, questionsAndAnswers) {
  const qaPairs = questionsAndAnswers.map((qa, i) =>
    `Q${i + 1}: ${qa.question}\nAnswer: ${qa.answer}\nScore: ${qa.score}/10`
  ).join('\n\n');

  const result = await model.generateContent(`You are an expert interviewer writing a final assessment for a ${role} candidate.

INTERVIEW TRANSCRIPT:
${qaPairs}

Write a final assessment. Return ONLY valid JSON:
{
  "overallScore": <1-100>,
  "verdict": "<STRONG_HIRE|HIRE|MAYBE|NO_HIRE>",
  "summary": "<3-4 sentence overall assessment>",
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasToImprove": ["<area 1>", "<area 2>", "<area 3>"],
  "recommendation": "<What the candidate should focus on to improve, 2-3 sentences>",
  "readinessLevel": "<Not Ready|Getting There|Almost Ready|Interview Ready>"
}

Return ONLY JSON, no markdown.`);

  return parseJSON(result.response.text());
}

module.exports = { generateQuestions, evaluateAnswer, generateFinalReport };
