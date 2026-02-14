const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

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

async function generateQuestions(role, difficulty, interviewType, count = 5) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are an expert interviewer for ${role} positions.

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
Return ONLY JSON, no markdown.`
    }]
  });

  const text = message.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}

async function evaluateAnswer(role, question, answer, difficulty) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are an expert interviewer evaluating a candidate for a ${role} position.

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
Return ONLY JSON, no markdown.`
    }]
  });

  const text = message.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}

async function generateFinalReport(role, questionsAndAnswers) {
  const qaPairs = questionsAndAnswers.map((qa, i) =>
    `Q${i + 1}: ${qa.question}\nAnswer: ${qa.answer}\nScore: ${qa.score}/10`
  ).join('\n\n');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are an expert interviewer writing a final assessment for a ${role} candidate.

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

Return ONLY JSON, no markdown.`
    }]
  });

  const text = message.content[0].text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}

module.exports = { generateQuestions, evaluateAnswer, generateFinalReport };
