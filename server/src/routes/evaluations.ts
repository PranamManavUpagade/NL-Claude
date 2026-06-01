import { Router } from 'express';
import { runEvaluation } from '../services/evaluation/orchestrator.js';
import { saveEvaluation, getEvaluation, listEvaluations, saveVerdict } from '../services/evaluation/evaluationStore.js';

export const evaluationsRouter = Router();

evaluationsRouter.post('/evaluations', async (req, res) => {
  try {
    const { ai_output, user_intent, stakes_level = 3, domain = 'general', mode = 'quick' } = req.body;

    if (!ai_output || !user_intent) {
      res.status(400).json({ error: 'ai_output and user_intent are required' });
      return;
    }

    const evaluation = await runEvaluation({
      ai_output,
      user_intent,
      stakes_level,
      domain,
      mode,
    });

    saveEvaluation(evaluation);
    res.status(201).json(evaluation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Evaluation failed';
    res.status(500).json({ error: message });
  }
});

evaluationsRouter.get('/evaluations', (_req, res) => {
  res.json(listEvaluations());
});

evaluationsRouter.get('/evaluations/:evaluationId', (req, res) => {
  const { evaluationId } = req.params;
  const evaluation = getEvaluation(evaluationId);

  if (!evaluation) {
    res.status(404).json({ error: 'Evaluation not found' });
    return;
  }

  res.json(evaluation);
});

evaluationsRouter.post('/evaluations/:evaluationId/verdict', (req, res) => {
  const { evaluationId } = req.params;
  const { trust_level, action, rationale } = req.body;

  if (!trust_level || !action || !rationale) {
    res.status(400).json({ error: 'trust_level, action, and rationale are required' });
    return;
  }

  if (typeof rationale !== 'string' || rationale.trim().length < 20) {
    res.status(400).json({ error: 'rationale must be at least 20 characters' });
    return;
  }

  const updatedEvaluation = saveVerdict(evaluationId, { trust_level, action, rationale });

  if (!updatedEvaluation) {
    res.status(404).json({ error: 'Evaluation not found' });
    return;
  }

  res.json(updatedEvaluation);
});
