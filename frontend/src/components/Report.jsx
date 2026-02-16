import React, { useState } from 'react';

function scoreClass(score) {
  if (score >= 70) return 'good';
  if (score >= 40) return 'ok';
  return 'bad';
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

function PriorityBadge({ priority }) {
  return <span className={`priority-badge priority-${priority}`}>{priority.toUpperCase()}</span>;
}

export default function Report({ data, onReset }) {
  const { report, details, meta } = data;
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'communication', label: 'Communication Profile' },
    { id: 'patterns', label: 'Interview Patterns' },
    { id: 'actionplan', label: 'Action Plan' },
    { id: 'breakdown', label: 'Q&A Breakdown' },
    { id: 'tips', label: 'Next Steps' },
  ];

  return (
    <div className="report">
      <div className="report-header">
        <div className={`report-score ${scoreClass(report.overallScore)}`}>
          {report.overallScore}
        </div>
        <div className="score-label" style={{ color: 'var(--text-dim)' }}>Overall Score</div>
        <div className={`verdict ${report.verdict}`}>{report.verdict.replace(/_/g, ' ')}</div>
        <div className="readiness">{report.readinessLevel}</div>
      </div>

      <div className="report-tabs">
        {sections.map(sec => (
          <button
            key={sec.id}
            className={`report-tab ${activeSection === sec.id ? 'active' : ''}`}
            onClick={() => setActiveSection(sec.id)}
          >
            {sec.label}
          </button>
        ))}
      </div>

      <div className="report-tab-content">
        {activeSection === 'overview' && (
          <>
            <div className="report-card">
              <h3>Summary</h3>
              <p className="report-summary">{report.summary}</p>
            </div>

            <div className="report-card strengths">
              <h3>Top Strengths</h3>
              <ul>{report.topStrengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>

            <div className="report-card improve">
              <h3>Areas to Improve</h3>
              <ul>{report.areasToImprove?.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </div>

            <div className="report-card">
              <h3>Recommendation</h3>
              <p className="report-summary">{report.recommendation}</p>
            </div>
          </>
        )}

        {activeSection === 'communication' && report.communicationProfile && (
          <div className="report-card">
            <h3>Communication Profile</h3>
            <p className="section-desc">How you come across in an interview setting, scored across five key dimensions.</p>
            <div className="comm-scores">
              <ScoreBar label="Clarity" value={report.communicationProfile.clarity} />
              <ScoreBar label="Conciseness" value={report.communicationProfile.conciseness} />
              <ScoreBar label="Confidence" value={report.communicationProfile.confidence} />
              <ScoreBar label="Storytelling" value={report.communicationProfile.storytelling} />
              <ScoreBar label="Technical Articulation" value={report.communicationProfile.technicalArticulation} />
            </div>
          </div>
        )}

        {activeSection === 'patterns' && report.interviewPatterns && (
          <div className="report-card">
            <h3>Interview Patterns</h3>
            <p className="section-desc">Patterns observed across all your answers.</p>

            <div className="pattern-trajectory">
              <span className="trajectory-label">Performance Trajectory:</span>
              <span className={`trajectory-value trajectory-${report.interviewPatterns.trajectory}`}>
                {report.interviewPatterns.trajectory === 'improving' ? 'Improving' :
                 report.interviewPatterns.trajectory === 'declining' ? 'Declining' : 'Stable'}
              </span>
            </div>

            {report.interviewPatterns.consistentStrengths?.length > 0 && (
              <div className="pattern-section">
                <h4>Consistent Strengths</h4>
                <ul className="pattern-list pattern-strengths">
                  {report.interviewPatterns.consistentStrengths.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}

            {report.interviewPatterns.consistentWeaknesses?.length > 0 && (
              <div className="pattern-section">
                <h4>Consistent Weaknesses</h4>
                <ul className="pattern-list pattern-weaknesses">
                  {report.interviewPatterns.consistentWeaknesses.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeSection === 'actionplan' && report.actionPlan?.length > 0 && (
          <div className="report-card">
            <h3>Personalized Action Plan</h3>
            <p className="section-desc">Your prioritized roadmap to interview readiness.</p>
            <div className="action-plan">
              {report.actionPlan.map((item, i) => (
                <div key={i} className="action-item">
                  <div className="action-header">
                    <PriorityBadge priority={item.priority} />
                    <span className="action-timeframe">{item.timeframe}</span>
                  </div>
                  <p className="action-text">{item.action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'breakdown' && (
          <div className="report-card">
            <h3>Question-by-Question Breakdown</h3>
            {details.map((d, i) => (
              <div key={i} className="qa-breakdown-item">
                <p className="qa-question">Q{i + 1}: {d.question}</p>
                <p className="qa-answer">
                  Your answer: {d.answer.substring(0, 200)}{d.answer.length > 200 ? '...' : ''}
                </p>
                <p className="qa-score-line">
                  Score: <span className={`qa-score ${d.score >= 7 ? 'good' : d.score >= 4 ? 'ok' : 'bad'}`}>
                    {d.score}/10
                  </span>
                  {' '}{d.feedback}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'tips' && (
          <div className="report-card">
            <h3>Tips for Your Next Practice Session</h3>
            {report.mockInterviewTips?.length > 0 && (
              <ul className="tips-list">
                {report.mockInterviewTips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>

      <button className="btn-secondary" onClick={onReset}>
        Start New Interview
      </button>
    </div>
  );
}
