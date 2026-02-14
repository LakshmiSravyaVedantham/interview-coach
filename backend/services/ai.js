const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

async function callAI(prompt) {
  if (GROQ_API_KEY) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.7 }),
    });
    if (res.ok) { const data = await res.json(); return data.choices[0].message.content; }
    console.warn('Groq failed, falling back to Ollama...');
  }
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
  });
  if (!res.ok) throw new Error('Both Groq and Ollama failed. Set GROQ_API_KEY or start Ollama.');
  return (await res.json()).response;
}

function parseJSON(text) {
  try { return JSON.parse(text.trim()); }
  catch { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); throw new Error('Failed to parse AI response'); }
}

const DIFFICULTY_MAP = {
  easy: 'Ask straightforward, common interview questions. Be encouraging.',
  medium: 'Ask standard industry interview questions with some follow-ups. Be professional.',
  hard: 'Ask challenging, senior-level questions with tricky follow-ups. Probe deeply into answers.'
};
const INTERVIEW_TYPES = {
  behavioral: 'Focus on behavioral questions (STAR method).',
  technical: 'Focus on technical knowledge, system design, problem-solving.',
  mixed: 'Mix behavioral and technical questions naturally.'
};

async function generateQuestions(role, difficulty, interviewType, count = 5) {
  const text = await callAI(`You are an expert interviewer for ${role} positions.
DIFFICULTY: ${difficulty} - ${DIFFICULTY_MAP[difficulty] || DIFFICULTY_MAP.medium}
TYPE: ${interviewType} - ${INTERVIEW_TYPES[interviewType] || INTERVIEW_TYPES.mixed}

Generate exactly ${count} interview questions. Return ONLY valid JSON:
{"questions":[{"id":1,"question":"<question>","category":"<behavioral|technical|situational>","hint":"<hint>"}]}

Return ONLY JSON, no markdown.`);
  return parseJSON(text);
}

async function evaluateAnswer(role, question, answer, difficulty) {
  const text = await callAI(`You are an expert interviewer evaluating a candidate for a ${role} position.
QUESTION: ${question}
CANDIDATE'S ANSWER: ${answer}
DIFFICULTY: ${difficulty}

Return ONLY valid JSON:
{"score":<1-10>,"feedback":"<2-3 sentences>","strengths":["<strength>"],"improvements":["<suggestion 1>","<suggestion 2>"],"sampleAnswer":"<strong example answer>"}

Return ONLY JSON, no markdown.`);
  return parseJSON(text);
}

async function generateFinalReport(role, questionsAndAnswers) {
  const qaPairs = questionsAndAnswers.map((qa, i) => `Q${i+1}: ${qa.question}\nAnswer: ${qa.answer}\nScore: ${qa.score}/10`).join('\n\n');
  const text = await callAI(`You are an expert interviewer writing a final assessment for a ${role} candidate.

INTERVIEW TRANSCRIPT:
${qaPairs}

Return ONLY valid JSON:
{"overallScore":<1-100>,"verdict":"<STRONG_HIRE|HIRE|MAYBE|NO_HIRE>","summary":"<3-4 sentences>","topStrengths":["<s1>","<s2>","<s3>"],"areasToImprove":["<a1>","<a2>","<a3>"],"recommendation":"<2-3 sentences>","readinessLevel":"<Not Ready|Getting There|Almost Ready|Interview Ready>"}

Return ONLY JSON, no markdown.`);
  return parseJSON(text);
}

module.exports = { generateQuestions, evaluateAnswer, generateFinalReport };
