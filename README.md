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
cp .env.example .env
npm install
npm start                # Runs on port 3002

# Frontend
cd frontend
npm install
npm run dev              # Runs on port 5175
```

### AI Setup (choose one - both are FREE)

| Provider | Best For | Setup |
|----------|----------|-------|
| **Groq** (cloud) | Deployment, sharing | Get free key at [console.groq.com/keys](https://console.groq.com/keys), add `GROQ_API_KEY` to `.env` |
| **Ollama** (local) | Development, offline | Install from [ollama.com](https://ollama.com), run `ollama pull llama3.2:3b` |

If both are configured, Groq is used first with Ollama as fallback.

## Tech Stack

- **Frontend**: React 19 + Vite
- **Backend**: Express.js + In-memory sessions
- **AI**: Groq (cloud) / Ollama (local) - both free, no paid API needed
