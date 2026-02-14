import React, { useState } from 'react';

function scoreClass(score) {
  if (score >= 7) return 'good';
  if (score >= 4) return 'ok';
  return 'bad';
}

export default function Interview({ question, progress, onSubmit, evaluation, loading }) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim().length >= 10) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  const pct = (progress.answered / progress.total) * 100;

  return (
    <div className="interview-panel">
      <div className="progress-bar">
        <span className="progress-text">Q{progress.answered + 1}/{progress.total}</span>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="question-card">
        <div className="q-label">{question.category} Question</div>
        <div className="q-text">{question.question}</div>
        {question.hint && <div className="q-hint">Hint: {question.hint}</div>}
      </div>

      {evaluation && (
        <div className="eval-card">
          <div className={`eval-score ${scoreClass(evaluation.score)}`}>
            {evaluation.score}/10
          </div>
          <p className="eval-feedback">{evaluation.feedback}</p>

          {evaluation.strengths?.length > 0 && (
            <div className="eval-section strengths">
              <h4>Strengths</h4>
              <ul>{evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
          )}

          {evaluation.improvements?.length > 0 && (
            <div className="eval-section improvements">
              <h4>How to improve</h4>
              <ul>{evaluation.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
          )}

          {evaluation.sampleAnswer && (
            <div className="sample-answer">
              <h4>Strong answer example</h4>
              <p>{evaluation.sampleAnswer}</p>
            </div>
          )}
        </div>
      )}

      <div className="answer-area">
        <textarea
          placeholder="Type your answer here... (minimum 10 characters)"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={loading}
        />
        <div className="char-count">{answer.length} characters</div>
      </div>

      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={answer.trim().length < 10 || loading}
      >
        {loading ? 'Evaluating...' : 'Submit Answer'}
      </button>
    </div>
  );
}
