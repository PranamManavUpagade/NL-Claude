# API Sketch — Calibrate API v1

Base: `/api/v1`

Endpoints

POST /evaluations
- Body: `{ ai_output, user_intent, stakes_level, domain, mode }`
- Returns: `EvaluationPackage` (see orchestrator.ts)

GET /evaluations
- Returns: list of evaluation summaries

GET /evaluations/{id}
- Returns: full evaluation package

POST /evaluations/{id}/verdict
- Body: `{ trust_level, action, rationale }`
- Returns: updated evaluation

GET /traces/{traceId}
- Returns: `TraceRecord` `{ id, dimension, prompt, raw_response, created_at }`

Examples

Create evaluation (curl):

```bash
curl -X POST http://localhost:3001/api/v1/evaluations \
  -H "Content-Type: application/json" \
  -d '{"ai_output":"The AI output...","user_intent":"Summarize key findings","stakes_level":3,"domain":"research","mode":"quick"}'
```

Get trace:

```bash
curl http://localhost:3001/api/v1/traces/<TRACE_ID>
```
