const API = '/api/interview';

export async function startInterview(role, difficulty, interviewType, questionCount) {
  const res = await fetch(`${API}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, difficulty, interviewType, questionCount }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function submitAnswer(sessionId, answer) {
  const res = await fetch(`${API}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, answer }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function getReport(sessionId) {
  const res = await fetch(`${API}/report/${sessionId}`);
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}
