import type { EvaluationPackage, VerdictPayload } from './orchestrator.js';

const evaluationStore = new Map<string, EvaluationPackage>();

export interface EvaluationSummary {
  evaluation_id: string;
  status: string;
  model: string;
  created_at: string;
  verdict?: VerdictPayload;
}

export function saveEvaluation(evaluation: EvaluationPackage) {
  evaluationStore.set(evaluation.evaluation_id, evaluation);
  return evaluation;
}

export function getEvaluation(evaluationId: string) {
  return evaluationStore.get(evaluationId) ?? null;
}

export function listEvaluations(): EvaluationSummary[] {
  return Array.from(evaluationStore.values()).map(
    ({ evaluation_id, status, model, created_at, verdict }) => ({
      evaluation_id,
      status,
      model,
      created_at,
      verdict,
    })
  );
}

export function saveVerdict(evaluationId: string, verdict: VerdictPayload) {
  const evaluation = evaluationStore.get(evaluationId);
  if (!evaluation) {
    return null;
  }

  evaluation.verdict = {
    ...verdict,
    created_at: new Date().toISOString(),
  };

  evaluationStore.set(evaluationId, evaluation);
  return evaluation;
}
