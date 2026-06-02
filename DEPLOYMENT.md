# Deployment: Streamlit (backend) + Vercel (frontend)

This document captures the minimal steps and files added to deploy the project with the backend monitored via Streamlit and the frontend deployed on Vercel.

1) Frontend (Vercel)

- Files added:
  - `client/.env.example` — set `VITE_API_BASE` to the actual backend API host (no trailing slash).

- Steps:
  - Connect `client/` as a project on Vercel (select the monorepo and point the root to `client`).
  - In Vercel Project Settings → Environment Variables, add `VITE_API_BASE` with the actual backend API host (for example `https://<your-api-host>`).
  - The client will directly make requests to the absolute backend URL compiled from `VITE_API_BASE` (no rewrite proxy required).
  - Deploy and verify that the application communicates successfully with the backend.

2) Backend (Streamlit wrapper + Express API)

- Files added:
  - `server/streamlit_app.py` — a small Streamlit app that polls the Express API health endpoint and exposes simple controls for monitoring.
  - `server/requirements.txt` — `streamlit` and `requests` to run the Streamlit app.

- Options:
  - Keep the core API in Node/Express (recommended) and host it on a Node-friendly host (Railway, Render, Fly, or Vercel Serverless functions). Use Streamlit only for monitoring and lightweight admin UI.
  - Alternatively port the API to Python/Streamlit if you want Streamlit to be the primary server — this is non-trivial and not performed by these changes.

- Steps (Streamlit Cloud):
  - Push `server/streamlit_app.py` and `server/requirements.txt` to GitHub.
  - Create a Streamlit app in Streamlit Cloud pointing to `server/streamlit_app.py`.
  - Set `SERVER_API_URL` secret in Streamlit secrets to the public API URL (e.g. `https://<your-api-host>/api/v1`).
  - Verify the monitoring app can fetch the `/health` endpoint.

3) CORS & env

- The server already reads `CLIENT_URL` in `server/.env.example` and configures CORS. Before production, update `CLIENT_URL` to the Vercel app URL and set it in the `server/.env` or host secrets.

4) Notes & next steps

- If you want a single host for both UI and API, consider hosting the Express API on a Node host and configure the client to communicate with it, or use Render to host both services.
- I can add GitHub Actions for automated deploys to Vercel and Streamlit. Tell me which automation you'd like next.
