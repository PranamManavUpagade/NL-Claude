# Calibrate — Graduation Project

AI output evaluation platform (React + Express + **Gemini 2.5 Flash**).

## Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Add your Gemini API key

```bash
copy server\.env.example server\.env
```

Edit `server/.env` and set:

```
GEMINI_API_KEY=your_actual_key_here
```

Get a key: https://aistudio.google.com/apikey

### 3. Run development

```bash
npm run dev
```

- **React app:** http://localhost:5173  
- **API:** http://localhost:3001  

## Quick API examples

Create an evaluation (example):

```bash
curl -X POST http://localhost:3001/api/v1/evaluations \
	-H "Content-Type: application/json" \
	-d '{"ai_output":"Example output","user_intent":"Summarize","stakes_level":3,"domain":"research","mode":"quick"}'
```

Get a trace record:

```bash
curl http://localhost:3001/api/v1/traces/<TRACE_ID>
```

## Project structure

| Folder | Stack |
|--------|--------|
| `client/` | React.js (Vite), React Router, Axios, Tailwind |
| `server/` | Express, `@google/generative-ai` (Gemini 2.5 Flash) |

See `ARCHITECTURE.md` for the full phase-wise plan.

## Security

Never put `GEMINI_API_KEY` in the React app or commit `server/.env`.
