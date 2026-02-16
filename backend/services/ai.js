const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

async function callAI(prompt) {
  if (GROQ_API_KEY) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 4096 }),
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
  catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]); }
      catch { /* fall through */ }
    }
    throw new Error('Failed to parse AI response');
  }
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
  const text = await callAI(`You are an elite interview coach who has served on Google's hiring committee and trained thousands of candidates. You evaluate with precision and depth.

ROLE: ${role}
DIFFICULTY: ${difficulty}
QUESTION: ${question}
CANDIDATE'S ANSWER: ${answer}

Perform a comprehensive evaluation across multiple dimensions:

1. STAR METHOD: Did the candidate use Situation-Task-Action-Result? Identify which elements are present/missing.
2. CONTENT QUALITY: Evaluate specificity (concrete examples vs vague claims), relevance, and technical depth.
3. COMMUNICATION: Detect filler words or vague language ("stuff", "things", "basically", "kind of", "sort of", "I think", "maybe"). Evaluate clarity.
4. CONFIDENCE: Does the answer show ownership ("I led", "I decided") or deflection ("we just", "they told me to")?
5. SCORING: Use a Google hiring committee rubric - score each dimension independently.
6. FOLLOW-UP QUESTIONS: What would a skilled interviewer ask next?
7. IDEAL ANSWER: Write the answer a top candidate would give.
8. DELIVERY TIPS: Body language, pacing, presentation improvements.
9. REWRITTEN ANSWER: Rewrite their answer to be significantly stronger while keeping their core content.

Return ONLY valid JSON (no markdown, no code fences):
{
  "score": <1-10 overall>,
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>"],
  "starAnalysis": {
    "situation": {"present": true, "feedback": "<what they said or what is missing>"},
    "task": {"present": false, "feedback": "<what they said or what is missing>"},
    "action": {"present": true, "feedback": "<what they said or what is missing>"},
    "result": {"present": false, "feedback": "<what they said or what is missing>"}
  },
  "detailedScores": {
    "relevance": <1-10>,
    "specificity": <1-10>,
    "structure": <1-10>,
    "communication": <1-10>,
    "confidence": <1-10>,
    "technicalDepth": <1-10>
  },
  "fillerWords": ["<detected filler word or phrase>"],
  "vagueStatements": ["<vague statement from their answer>"],
  "followUpQuestions": ["<follow-up Q1>", "<follow-up Q2>", "<follow-up Q3>"],
  "idealAnswer": "<the ideal answer a top candidate would give>",
  "rewrittenAnswer": "<their answer rewritten to be much stronger>",
  "deliveryTips": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "sampleAnswer": "<brief strong example answer>"
}

Use true/false booleans for present fields. Be thorough and actionable. Return ONLY JSON.`);
  return parseJSON(text);
}

async function generateFinalReport(role, questionsAndAnswers) {
  const qaPairs = questionsAndAnswers.map((qa, i) =>
    `Q${i+1}: ${qa.question}\nAnswer: ${qa.answer}\nScore: ${qa.score}/10`
  ).join('\n\n');

  const text = await callAI(`You are an elite interview coach writing a comprehensive final assessment for a ${role} candidate. You have evaluated candidates for top tech companies.

INTERVIEW TRANSCRIPT:
${qaPairs}

Provide a thorough final report. Analyze patterns across all answers.

Return ONLY valid JSON (no markdown, no code fences):
{
  "overallScore": <1-100>,
  "verdict": "<STRONG_HIRE|HIRE|MAYBE|NO_HIRE>",
  "summary": "<4-5 sentence comprehensive summary>",
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasToImprove": ["<area 1>", "<area 2>", "<area 3>"],
  "recommendation": "<3-4 sentences of specific next steps>",
  "readinessLevel": "<Not Ready|Getting There|Almost Ready|Interview Ready>",
  "communicationProfile": {
    "clarity": <1-10>,
    "conciseness": <1-10>,
    "confidence": <1-10>,
    "storytelling": <1-10>,
    "technicalArticulation": <1-10>
  },
  "interviewPatterns": {
    "consistentStrengths": ["<pattern 1>", "<pattern 2>"],
    "consistentWeaknesses": ["<pattern 1>", "<pattern 2>"],
    "trajectory": "<improving|stable|declining>"
  },
  "actionPlan": [
    {"priority": "high", "action": "<specific action item>", "timeframe": "<e.g., 1 week>"},
    {"priority": "medium", "action": "<specific action item>", "timeframe": "<e.g., 2 weeks>"},
    {"priority": "low", "action": "<specific action item>", "timeframe": "<e.g., 1 month>"}
  ],
  "mockInterviewTips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}

Return ONLY JSON.`);
  return parseJSON(text);
}

module.exports = { generateQuestions, evaluateAnswer, generateFinalReport };
