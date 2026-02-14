const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { generateQuestions, evaluateAnswer, generateFinalReport } = require('../services/ai');

const router = express.Router();

// In-memory session store
const sessions = new Map();

// POST /api/interview/start - Start a new interview session
router.post('/start', async (req, res) => {
  try {
    const { role, difficulty, interviewType, questionCount } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const count = Math.min(Math.max(questionCount || 5, 3), 10);
    const data = await generateQuestions(
      role,
      difficulty || 'medium',
      interviewType || 'mixed',
      count
    );

    const sessionId = uuidv4();
    sessions.set(sessionId, {
      role,
      difficulty: difficulty || 'medium',
      interviewType: interviewType || 'mixed',
      questions: data.questions,
      answers: [],
      currentIndex: 0,
      startedAt: new Date().toISOString()
    });

    // Clean old sessions (older than 2 hours)
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    for (const [id, session] of sessions) {
      if (new Date(session.startedAt).getTime() < twoHoursAgo) {
        sessions.delete(id);
      }
    }

    res.json({
      sessionId,
      totalQuestions: data.questions.length,
      currentQuestion: data.questions[0],
      role,
      difficulty: difficulty || 'medium'
    });
  } catch (err) {
    console.error('Start error:', err);
    res.status(500).json({ error: err.message || 'Failed to start interview' });
  }
});

// POST /api/interview/answer - Submit an answer
router.post('/answer', async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId || !answer) {
      return res.status(400).json({ error: 'sessionId and answer are required' });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    const currentQ = session.questions[session.currentIndex];
    const evaluation = await evaluateAnswer(
      session.role,
      currentQ.question,
      answer,
      session.difficulty
    );

    session.answers.push({
      question: currentQ.question,
      answer,
      score: evaluation.score,
      evaluation
    });

    session.currentIndex++;

    const isComplete = session.currentIndex >= session.questions.length;
    const nextQuestion = isComplete ? null : session.questions[session.currentIndex];

    res.json({
      evaluation,
      isComplete,
      nextQuestion,
      progress: {
        answered: session.currentIndex,
        total: session.questions.length
      }
    });
  } catch (err) {
    console.error('Answer error:', err);
    res.status(500).json({ error: err.message || 'Failed to evaluate answer' });
  }
});

// GET /api/interview/report/:sessionId - Get final report
router.get('/report/:sessionId', async (req, res) => {
  try {
    const session = sessions.get(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    if (session.answers.length < session.questions.length) {
      return res.status(400).json({ error: 'Interview not complete yet' });
    }

    const report = await generateFinalReport(session.role, session.answers);

    res.json({
      report,
      details: session.answers.map(a => ({
        question: a.question,
        answer: a.answer,
        score: a.score,
        feedback: a.evaluation.feedback
      })),
      meta: {
        role: session.role,
        difficulty: session.difficulty,
        type: session.interviewType,
        duration: session.startedAt
      }
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate report' });
  }
});

module.exports = router;
