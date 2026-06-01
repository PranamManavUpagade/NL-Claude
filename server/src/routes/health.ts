import { Router } from 'express';
import { GEMINI_MODEL } from '../services/gemini/client.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'calibrate-api',
    llm: GEMINI_MODEL,
    geminiConfigured: Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== 'AIzaSyDKmpRKQzz1TSM6Z2H4DooU5aTHNdWZVUk'
    ),
  });
});
