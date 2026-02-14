import React, { useState } from 'react';

export default function Setup({ onStart, loading }) {
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [interviewType, setInterviewType] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(5);

  const handleStart = () => {
    if (role.trim()) {
      onStart({ role: role.trim(), difficulty, interviewType, questionCount });
    }
  };

  return (
    <div className="setup-card">
      <div className="form-group">
        <label>Target Role</label>
        <input
          type="text"
          placeholder="e.g., Senior Software Engineer, Product Manager, Data Scientist..."
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy - Entry level</option>
            <option value="medium">Medium - Mid level</option>
            <option value="hard">Hard - Senior level</option>
          </select>
        </div>
        <div className="form-group">
          <label>Interview Type</label>
          <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)}>
            <option value="mixed">Mixed</option>
            <option value="behavioral">Behavioral</option>
            <option value="technical">Technical</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Number of Questions ({questionCount})</label>
        <input
          type="range"
          min="3"
          max="10"
          value={questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
      </div>

      <button className="btn-primary" onClick={handleStart} disabled={!role.trim() || loading}>
        {loading ? 'Preparing interview...' : 'Start Interview'}
      </button>
    </div>
  );
}
