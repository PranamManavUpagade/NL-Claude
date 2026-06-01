import axios from 'axios';

const rawBase = import.meta.env.VITE_API_BASE;
const baseURL = rawBase && (rawBase as string).length > 0 ? `${(rawBase as string).replace(/\/$/, '')}/api/v1` : '/api/v1';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export interface HealthResponse {
  status: string;
  service: string;
  llm: string;
  geminiConfigured: boolean;
}

export interface EvaluationRequest {
  ai_output: string;
  user_intent: string;
  stakes_level?: number;
  domain?: 'research' | 'writing' | 'career' | 'general';
  mode?: 'quick' | 'deep';
}

export interface VerdictPayload {
  trust_level: 'low' | 'medium' | 'high';
  action: 'use' | 'revise' | 'discard';
  rationale: string;
}

export interface EvaluationResponse {
  evaluation_id: string;
  status: 'complete';
  model: string;
  created_at: string;
  trace_ids: string[];
  dimensions: {
    correctness: { claims: string[]; warnings: string[]; trace_id: string };
    completeness: { gaps: string[]; risks: string[]; trace_id: string };
    reasoning: { steps: string[]; weaknesses: string[]; trace_id: string };
    usefulness: { alignment: string; rationale: string; trace_id: string };
    uncertainty: { items: string[]; trace_id: string };
  };
  verdict?: VerdictPayload & { created_at: string };
}

export interface EvaluationSummary {
  evaluation_id: string;
  status: 'complete';
  model: string;
  created_at: string;
  verdict?: VerdictPayload & { created_at: string };
}

export interface TraceRecord {
  id: string;
  dimension: string;
  prompt: string;
  raw_response: string;
  created_at: string;
}

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health');
  return data;
}

export async function createEvaluation(body: EvaluationRequest) {
  const { data } = await api.post<EvaluationResponse>('/evaluations', body);
  return data;
}

export async function getEvaluations() {
  const { data } = await api.get<EvaluationSummary[]>('/evaluations');
  return data;
}

export async function getEvaluation(evaluationId: string) {
  const { data } = await api.get<EvaluationResponse>(`/evaluations/${evaluationId}`);
  return data;
}

export async function submitVerdict(evaluationId: string, verdict: VerdictPayload) {
  const { data } = await api.post<EvaluationResponse>(`/evaluations/${evaluationId}/verdict`, verdict);
  return data;
}

export async function getTrace(traceId: string) {
  const { data } = await api.get<TraceRecord>(`/traces/${traceId}`);
  return data;
}

export default api;
