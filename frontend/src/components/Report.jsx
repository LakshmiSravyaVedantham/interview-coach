import React from 'react';

function scoreClass(score) {
  if (score >= 70) return 'good';
  if (score >= 40) return 'ok';
  return 'bad';
}

export default function Report({ data, onReset }) {
  const { report, details, meta } = data;

  return (
    <div className="report">
      <div className="report-header">
        <div className={`report-score ${scoreClass(report.overallScore)}`}>
          {report.overallScore}
        </div>
        <div className="score-label" style={{ color: 'var(--text-dim)' }}>Overall Score</div>
        <div className={`verdict ${report.verdict}`}>{report.verdict.replace('_', ' ')}</div>
        <div className="readiness">{report.readinessLevel}</div>
      </div>

      <div className="report-card">
        <h3>Summary</h3>
        <p className="report-summary">{report.summary}</p>
      </div>

      <div className="report-card strengths">
        <h3>Top Strengths</h3>
        <ul>{report.topStrengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
      </div>

      <div className="report-card improve">
        <h3>Areas to Improve</h3>
        <ul>{report.areasToImprove.map((a, i) => <li key={i}>{a}</li>)}</ul>
      </div>

      <div className="report-card">
        <h3>Recommendation</h3>
        <p className="report-summary">{report.recommendation}</p>
      </div>

      <div className="report-card">
        <h3>Question-by-Question Breakdown</h3>
        {details.map((d, i) => (
          <div key={i} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.3rem' }}>Q{i + 1}: {d.question}</p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
              Your answer: {d.answer.substring(0, 150)}{d.answer.length > 150 ? '...' : ''}
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              Score: <span style={{ fontWeight: 700, color: d.score >= 7 ? 'var(--success)' : d.score >= 4 ? 'var(--warning)' : 'var(--danger)' }}>
                {d.score}/10
              </span>
              {' - '}{d.feedback}
            </p>
          </div>
        ))}
      </div>

      <button className="btn-secondary" onClick={onReset}>
        Start New Interview
      </button>
    </div>
  );
}
