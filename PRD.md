# Product Requirements Document (PRD) — Calibrate

Status: draft

Overview
- Product vision: Help knowledge workers decide whether AI-generated outputs are "good enough" by surfacing claims, gaps, reasoning, usefulness, and uncertainties.

Goals
- Build evaluation engine (server) returning structured dimensions + traces
- Provide UI to review dimensions, open traces, and submit a required verdict before export

Users
- Knowledge workers (researchers, writers, career professionals)

MVP scope
- `POST /api/v1/evaluations` returns full evaluation package
- Trace view endpoint
- Client: New evaluation flow, evaluation detail, verdict submission, export

Open items
- Auth model for pilots
- Storage retention policy
- Analytics events mapping

Design artifacts: link Figma prototype here (add URL when available)
