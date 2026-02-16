import React, { useState } from 'react';

function scoreClass(score) {
  if (score >= 7) return 'good';
  if (score >= 4) return 'ok';
  return 'bad';
}

function StarBadge({ present }) {
  return (
    <span className={`star-badge ${present ? 'star-present' : 'star-missing'}`}>
      {present ? 'Present' : 'Missing'}
    </span>
  );
}

function ScoreBar({ label, value, max = 10 }) {
  const pct = (value / max) * 100;
  const cls = value >= 7 ? 'good' : value >= 4 ? 'ok' : 'bad';
  return (
    <div className="score-bar-row">
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div className={`score-bar-fill ${cls}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`score-bar-value ${cls}`}>{value}/{max}</span>
    </div>
  );
}

export default function Interview({ question, progress, onSubmit, evaluation, loading }) {
  const [answer, setAnswer] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const handleSubmit = () => {
    if (answer.trim().length >= 10) {
      onSubmit(answer.trim());
      setAnswer('');
      setActiveTab('overview');
    }
  };

  const pct = (progress.answered / progress.total) * 100;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'star', label: 'STAR Analysis' },
    { id: 'scores', label: 'Detailed Scores' },
    { id: 'language', label: 'Language Check' },
    { id: 'followup', label: 'Follow-ups' },
    { id: 'ideal', label: 'Ideal Answer' },
    { id: 'rewrite', label: 'Rewritten' },
    { id: 'delivery', label: 'Delivery Tips' },
  ];

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

          <div className="eval-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`eval-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="eval-tab-content">
            {activeTab === 'overview' && (
              <>
                {evaluation.strengths?.length > 0 && (
                  <div className="eval-section strengths">
                    <h4>Strengths</h4>
                    <ul>{evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}
                {evaluation.improvements?.length > 0 && (
                  <div className="eval-section improvements">
                    <h4>How to Improve</h4>
                    <ul>{evaluation.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}
                {evaluation.sampleAnswer && (
                  <div className="sample-answer">
                    <h4>Strong Answer Example</h4>
                    <p>{evaluation.sampleAnswer}</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'star' && evaluation.starAnalysis && (
              <div className="star-analysis">
                <h4>STAR Method Breakdown</h4>
                <p className="star-desc">The STAR method (Situation-Task-Action-Result) is the gold standard for structuring interview answers.</p>
                {['situation', 'task', 'action', 'result'].map(key => {
                  const item = evaluation.starAnalysis[key];
                  if (!item) return null;
                  return (
                    <div key={key} className={`star-item ${item.present ? 'star-item-present' : 'star-item-missing'}`}>
                      <div className="star-item-header">
                        <span className="star-item-letter">{key.charAt(0).toUpperCase()}</span>
                        <span className="star-item-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        <StarBadge present={item.present} />
                      </div>
                      <p className="star-item-feedback">{item.feedback}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'scores' && evaluation.detailedScores && (
              <div className="detailed-scores">
                <h4>Google Hiring Committee Rubric</h4>
                <ScoreBar label="Relevance" value={evaluation.detailedScores.relevance} />
                <ScoreBar label="Specificity" value={evaluation.detailedScores.specificity} />
                <ScoreBar label="Structure" value={evaluation.detailedScores.structure} />
                <ScoreBar label="Communication" value={evaluation.detailedScores.communication} />
                <ScoreBar label="Confidence" value={evaluation.detailedScores.confidence} />
                <ScoreBar label="Technical Depth" value={evaluation.detailedScores.technicalDepth} />
              </div>
            )}

            {activeTab === 'language' && (
              <div className="language-check">
                {evaluation.fillerWords?.length > 0 && (
                  <div className="language-section">
                    <h4>Filler Words Detected</h4>
                    <div className="tag-list">
                      {evaluation.fillerWords.map((w, i) => (
                        <span key={i} className="tag tag-warning">{w}</span>
                      ))}
                    </div>
                    <p className="language-tip">Eliminate these to sound more confident and polished.</p>
                  </div>
                )}
                {evaluation.vagueStatements?.length > 0 && (
                  <div className="language-section">
                    <h4>Vague Statements</h4>
                    <ul className="vague-list">
                      {evaluation.vagueStatements.map((v, i) => (
                        <li key={i}><span className="vague-quote">"{v}"</span></li>
                      ))}
                    </ul>
                    <p className="language-tip">Replace these with specific numbers, names, or concrete outcomes.</p>
                  </div>
                )}
                {(!evaluation.fillerWords || evaluation.fillerWords.length === 0) &&
                 (!evaluation.vagueStatements || evaluation.vagueStatements.length === 0) && (
                  <div className="language-clean">
                    <span className="clean-icon">&#10003;</span>
                    <p>Clean language! No filler words or vague statements detected.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'followup' && evaluation.followUpQuestions?.length > 0 && (
              <div className="followup-section">
                <h4>Likely Follow-up Questions</h4>
                <p className="followup-desc">An interviewer would probably ask these next. Prepare answers for each.</p>
                <ol className="followup-list">
                  {evaluation.followUpQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ol>
              </div>
            )}

            {activeTab === 'ideal' && evaluation.idealAnswer && (
              <div className="ideal-answer-section">
                <h4>Ideal Answer (Top Candidate)</h4>
                <p className="ideal-desc">This is what a top-performing candidate would say. Compare with your answer to identify gaps.</p>
                <div className="ideal-answer-box">
                  <p>{evaluation.idealAnswer}</p>
                </div>
              </div>
            )}

            {activeTab === 'rewrite' && evaluation.rewrittenAnswer && (
              <div className="rewrite-section">
                <h4>Your Answer, Upgraded</h4>
                <p className="rewrite-desc">Here is your core answer rewritten to be significantly stronger while preserving your key points.</p>
                <div className="rewrite-box">
                  <p>{evaluation.rewrittenAnswer}</p>
                </div>
              </div>
            )}

            {activeTab === 'delivery' && evaluation.deliveryTips?.length > 0 && (
              <div className="delivery-section">
                <h4>Body Language &amp; Delivery Tips</h4>
                <ul className="delivery-list">
                  {evaluation.deliveryTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
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
