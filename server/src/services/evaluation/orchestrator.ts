import { generateText } from '../gemini/client.js';
import { saveTrace } from './traceStore.js';
import { buildDimensionPrompt, parseJsonResponse, EvaluationContext } from './prompt.js';

interface DimensionResult<T> {
  trace_id: string;
  raw: string;
  payload: T;
}

export type VerdictPayload = {
  trust_level: 'low' | 'medium' | 'high';
  action: 'use' | 'revise' | 'discard';
  rationale: string;
  created_at?: string;
};

export interface EvaluationPackage {
  evaluation_id: string;
  status: 'complete';
  model: string;
  created_at: string;
  trace_ids: string[];
  verdict?: VerdictPayload;
  dimensions: {
    correctness: { claims: string[]; warnings: string[]; trace_id: string };
    completeness: { gaps: string[]; risks: string[]; trace_id: string };
    reasoning: { steps: string[]; weaknesses: string[]; trace_id: string };
    usefulness: { alignment: string; rationale: string; trace_id: string };
    uncertainty: { items: string[]; trace_id: string };
  };
}

function buildTraceRecord<T>(dimension: string, prompt: string, raw: string) {
  return saveTrace({ dimension, prompt, raw_response: raw });
}

async function evaluateDimension<T>(
  dimension: 'correctness' | 'completeness' | 'reasoning' | 'usefulness' | 'uncertainty',
  context: EvaluationContext
): Promise<DimensionResult<T>> {
  const prompt = buildDimensionPrompt(dimension, context);
  const raw = await generateText(prompt);
  const payload = parseJsonResponse<T>(raw);
  const trace = buildTraceRecord(dimension, prompt, raw);
  return { trace_id: trace.id, raw, payload };
}

export async function runEvaluation(context: EvaluationContext): Promise<EvaluationPackage> {
  const [correctness, completeness, reasoning, usefulness, uncertainty] = await Promise.all([
    evaluateDimension<{ claims: string[]; warnings: string[] }>('correctness', context),
    evaluateDimension<{ gaps: string[]; risks: string[] }>('completeness', context),
    evaluateDimension<{ steps: string[]; weaknesses: string[] }>('reasoning', context),
    evaluateDimension<{ alignment: string; rationale: string }>('usefulness', context),
    evaluateDimension<{ items: string[] }>('uncertainty', context),
  ]);

  return {
    evaluation_id: crypto.randomUUID(),
    status: 'complete',
    model: 'gemini-2.5-flash',
    created_at: new Date().toISOString(),
    trace_ids: [
      correctness.trace_id,
      completeness.trace_id,
      reasoning.trace_id,
      usefulness.trace_id,
      uncertainty.trace_id,
    ],
    dimensions: {
      correctness: {
        claims: correctness.payload.claims ?? [],
        warnings: correctness.payload.warnings ?? [],
        trace_id: correctness.trace_id,
      },
      completeness: {
        gaps: completeness.payload.gaps ?? [],
        risks: completeness.payload.risks ?? [],
        trace_id: completeness.trace_id,
      },
      reasoning: {
        steps: reasoning.payload.steps ?? [],
        weaknesses: reasoning.payload.weaknesses ?? [],
        trace_id: reasoning.trace_id,
      },
      usefulness: {
        alignment: usefulness.payload.alignment ?? 'medium',
        rationale: usefulness.payload.rationale ?? '',
        trace_id: usefulness.trace_id,
      },
      uncertainty: {
        items: uncertainty.payload.items ?? [],
        trace_id: uncertainty.trace_id,
      },
    },
  };
}
