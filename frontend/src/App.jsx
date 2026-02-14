import React, { useState } from 'react';
import Setup from './components/Setup';
import Interview from './components/Interview';
import Report from './components/Report';
import { startInterview, submitAnswer, getReport } from './utils/api';

export default function App() {
  const [phase, setPhase] = useState('setup'); // setup | interview | report
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [progress, setProgress] = useState({ answered: 0, total: 0 });
  const [lastEval, setLastEval] = useState(null);
  const [reportData, setReportData] = useState(null);

  const handleStart = async ({ role, difficulty, interviewType, questionCount }) => {
    setLoading(true);
    setError('');
    try {
      const data = await startInterview(role, difficulty, interviewType, questionCount);
      setSessionId(data.sessionId);
      setCurrentQuestion(data.currentQuestion);
      setProgress({ answered: 0, total: data.totalQuestions });
      setLastEval(null);
      setPhase('interview');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleAnswer = async (answer) => {
    setLoading(true);
    setError('');
    try {
      const data = await submitAnswer(sessionId, answer);
      setLastEval(data.evaluation);
      setProgress(data.progress);

      if (data.isComplete) {
        // Small delay to show last evaluation before report
        setTimeout(async () => {
          try {
            const report = await getReport(sessionId);
            setReportData(report);
            setPhase('report');
          } catch (err) {
            setError(err.message);
          }
          setLoading(false);
        }, 3000);
      } else {
        setCurrentQuestion(data.nextQuestion);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPhase('setup');
    setSessionId(null);
    setCurrentQuestion(null);
    setLastEval(null);
    setReportData(null);
    setError('');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AI Interview Coach</h1>
        <p>Practice interviews. Get real feedback. Land the job.</p>
      </header>

      {error && (
        <div style={{ background: 'rgba(225,112,85,0.1)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', textAlign: 'center', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {phase === 'setup' && <Setup onStart={handleStart} loading={loading} />}

      {phase === 'interview' && currentQuestion && (
        <Interview
          question={currentQuestion}
          progress={progress}
          onSubmit={handleAnswer}
          evaluation={lastEval}
          loading={loading}
        />
      )}

      {phase === 'interview' && loading && !currentQuestion && (
        <div className="loading">
          <div className="spinner" />
          <p>Generating your final report...</p>
        </div>
      )}

      {phase === 'report' && reportData && (
        <Report data={reportData} onReset={handleReset} />
      )}
    </div>
  );
}
