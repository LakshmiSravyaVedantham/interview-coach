# AI Interview Coach

Practice job interviews with AI. Get real-time feedback on every answer and a final assessment report.

## Features

- **Custom Role** - Practice for any job title
- **3 Difficulty Levels** - Easy, Medium, Hard
- **3 Interview Types** - Behavioral, Technical, Mixed
- **Real-time Scoring** - Each answer scored 1-10
- **Detailed Feedback** - Strengths, improvements, sample answers
- **Final Report** - Overall score, verdict (Hire/No Hire), readiness level
- **Question-by-question breakdown**

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env     # Add your ANTHROPIC_API_KEY
npm install
npm start                # Runs on port 3002

# Frontend
cd frontend
npm install
npm run dev              # Runs on port 3000
```

## Tech Stack

- **Frontend**: React 19 + Vite
- **Backend**: Express.js + In-memory sessions
- **AI**: Claude API (Anthropic)
