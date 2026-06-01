# Deploying to Railway

This guide walks through deploying the Node.js backend to Railway and connecting it to your Vercel frontend.

## Step 1: Prepare for Railway deployment

1. Ensure `server/package.json` has a `build` script (should be present; if not, add `"build": "tsc"`).
2. Ensure `server/package.json` has a `start` script that runs the compiled code (should be present; if not, add `"start": "node dist/index.js"`).
3. Commit and push all changes to GitHub.

## Step 2: Create a Railway account and project

1. Go to [railway.app](https://railway.app) and sign up (or log in).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Authorize Railway to access your GitHub account.
4. Select the `PranamManavUpagade/NL-Claude` repository.

## Step 3: Configure Railway project settings

1. After selecting the repo, Railway will auto-detect the project structure.
2. In the Railway project dashboard:
   - **Root Directory**: Set to `server/` (the backend folder).
   - **Build Command**: `npm run build` (Railway may auto-detect this).
   - **Start Command**: `npm start` (Railway may auto-detect this).

3. Under **Variables** (or **Settings → Environment**), add:
   - `GEMINI_API_KEY`: Paste your Gemini API key.
   - `PORT`: `3001` (or leave blank; Railway assigns a port by default).
   - `CLIENT_URL`: Your Vercel frontend URL (e.g., `https://nl-claude.vercel.app`).
   - `NODE_ENV`: `production`.
   - `USE_DUMMY_EVALUATION`: `false` (so it uses real Gemini, not dummy fallback).

4. Click **Deploy** to trigger the first build.

## Step 4: Get your Railway backend URL

1. After deployment succeeds, go to the Railway project dashboard.
2. Click on the **Deployments** tab and find the active deployment.
3. Look for the **Public URL** or **Domain**—it will look like:
   ```
   https://your-app.railway.app
   ```
   Copy this URL.

## Step 5: Update Vercel environment variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Select your `nl-claude` project.
3. Go to **Settings → Environment Variables**.
4. Update or add `VITE_API_BASE` with your Railway backend URL (no trailing slash):
   ```
   VITE_API_BASE=https://your-app.railway.app
   ```
5. Vercel will automatically redeploy the frontend with the new environment variable.

## Step 6: Verify the connection

1. Open your Vercel frontend: `https://nl-claude.vercel.app`.
2. Go to the Evaluate page.
3. Fill in the form and submit.
4. Check the browser console (F12 → Console) for any CORS or network errors.
5. If it works, you should see evaluation results.

Alternatively, test the health endpoint directly:
```bash
curl https://your-app.railway.app/api/v1/health
```

Should return JSON like:
```json
{
  "status": "ok",
  "service": "calibrate-api",
  "llm": "gemini-2.5-flash",
  "geminiConfigured": true
}
```

## Notes

- Railway auto-redeploys when you push to GitHub (if you have the GitHub integration set up).
- Keep your `GEMINI_API_KEY` secret—never commit it to the repo; always use Railway's environment variables.
- If deployment fails, check the Railway build logs for errors.
