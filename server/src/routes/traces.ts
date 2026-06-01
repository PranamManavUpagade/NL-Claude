import { Router } from 'express';
import { getTrace } from '../services/evaluation/traceStore.js';

export const tracesRouter = Router();

tracesRouter.get('/traces/:traceId', (req, res) => {
  const { traceId } = req.params;
  const trace = getTrace(traceId);

  if (!trace) {
    res.status(404).json({ error: 'Trace not found' });
    return;
  }

  res.json(trace);
});
