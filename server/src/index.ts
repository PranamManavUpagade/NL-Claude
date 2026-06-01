import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { evaluationsRouter } from './routes/evaluations.js';
import { healthRouter } from './routes/health.js';
import { tracesRouter } from './routes/traces.js';

const app = express();
const PORT = process.env.PORT ?? 3001;
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // In development, log rejected origins; in production, silently reject
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`CORS: Rejected origin ${origin}`);
        }
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  })
);
app.use(express.json({ limit: '2mb' }));

app.use('/api/v1', healthRouter);
app.use('/api/v1', evaluationsRouter);
app.use('/api/v1', tracesRouter);

app.listen(PORT, () => {
  console.log(`Calibrate API running on http://localhost:${PORT}`);
  console.log(`LLM: gemini-2.5-flash`);
});
