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

function getDummyPayload<T>(dimension: 'correctness' | 'completeness' | 'reasoning' | 'usefulness' | 'uncertainty'): T {
  switch (dimension) {
    case 'correctness':
      return {
        claims: ['The provided output appears to be a valid answer, but this is a dummy fallback.'],
        warnings: ['Unable to reach Gemini; using local fallback payload.'],
      } as unknown as T;
    case 'completeness':
      return {
        gaps: ['This is fallback content. No live Gemini evaluation was run.'],
        risks: ['No live AI evaluation due to quota or connectivity.'],
      } as unknown as T;
    case 'reasoning':
      return {
        steps: ['The system could not execute live reasoning due to backend limitations.'],
        weaknesses: ['Fallback mode is active; treat this output as a placeholder.'],
      } as unknown as T;
    case 'usefulness':
      return {
        alignment: 'medium',
        rationale: 'Live backend evaluation is unavailable, so this is a fallback response.',
      } as unknown as T;
    case 'uncertainty':
      return {
        items: ['The evaluation is using fallback content because the Gemini service was unavailable.'],
      } as unknown as T;
    default:
      return {} as T;
  }
}

async function evaluateDimension<T>(
  dimension: 'correctness' | 'completeness' | 'reasoning' | 'usefulness' | 'uncertainty',
  context: EvaluationContext
): Promise<DimensionResult<T>> {
  const prompt = buildDimensionPrompt(dimension, context);

  let raw: string;
  let payload: T;

  try {
    raw = await generateText(prompt);
    payload = parseJsonResponse<T>(raw);
  } catch (error) {
    const useFallback = process.env.USE_DUMMY_EVALUATION === 'true' || process.env.NODE_ENV !== 'production';
    if (!useFallback) {
      throw error;
    }

    console.warn(`Falling back to dummy evaluation payload for ${dimension}:`, error instanceof Error ? error.message : error);
    payload = getDummyPayload<T>(dimension);
    raw = JSON.stringify(payload);
  }

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
