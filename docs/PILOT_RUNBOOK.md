# Pilot Runbook — Calibrate (Staging)

Purpose: step-by-step to run a staged pilot and collect CAR.

Prereqs
- Gemini API key in `server/.env`
- Staging host or local network accessible site

Steps
1. Install dependencies

```bash
npm run install:all
```

2. Start dev servers locally (or deploy staging)

```bash
npm run dev
```

3. Create a test evaluation via the UI at `/evaluate/new` and record behavior.
4. Instrument analytics: confirm `localStorage.calibrate_analytics` contains events for `evaluation_start`, `evaluation_complete`, `trace_open`, `verdict_submitted`.
5. Run 5 internal dogfood sessions and collect feedback.
6. Recruit pilot cohort and distribute staging URL + consent form.
7. Monitor metrics weekly; compute CAR after 7 days for "ready" verdicts.

Notes
- For production analytics replace `client/src/services/analytics.ts` with PostHog/Segment integration.
