export type EvaluationDimension =
  | 'correctness'
  | 'completeness'
  | 'reasoning'
  | 'usefulness'
  | 'uncertainty';

export interface EvaluationContext {
  ai_output: string;
  user_intent: string;
  stakes_level: number;
  domain: string;
  mode: string;
}

const DIMENSION_INSTRUCTIONS: Record<EvaluationDimension, string> = {
  correctness:
    'Extract the strongest claims and note any claim that is unsupported, inaccurate, or misleading relative to the user intent.',
  completeness:
    'Identify what is missing for this output to satisfy the user intent and the stated stakes.',
  reasoning:
    'Analyze the output reasoning flow and summarize logical strengths, weak links, or leap-of-faith steps.',
  usefulness:
    'Assess whether the output is actionable and aligned with the user intent given the stakes.',
  uncertainty:
    'List specific uncertainties, assumptions, open questions, or areas where the output appears overconfident.',
};

export type ExaminedDimension = EvaluationDimension;

export function buildDimensionPrompt(
  dimension: ExaminedDimension,
  context: EvaluationContext
) {
  return `You are an assistive evaluation engine for Calibrate. Do NOT provide a single trust score, verdict, or recommendation. Return only valid JSON.

Task: ${DIMENSION_INSTRUCTIONS[dimension]}

User intent: ${context.user_intent}
Stakes: ${context.stakes_level}
Domain: ${context.domain}
Mode: ${context.mode}

AI output:
${context.ai_output}

Return JSON with the following shape for ${dimension}:
${getExpectedResponseShape(dimension)}
`;
}

function getExpectedResponseShape(dimension: ExaminedDimension) {
  switch (dimension) {
    case 'correctness':
      return '{"claims": ["string"], "warnings": ["string"]}';
    case 'completeness':
      return '{"gaps": ["string"], "risks": ["string"]}';
    case 'reasoning':
      return '{"steps": ["string"], "weaknesses": ["string"]}';
    case 'usefulness':
      return '{"alignment": "high|medium|low", "rationale": "string"}';
    case 'uncertainty':
      return '{"items": ["string"]}';
    default:
      return '{}';
  }
}

export function parseJsonResponse<T>(raw: string): T {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Unable to find JSON object in model response');
  }
  const candidate = raw.slice(start, end + 1);
  return JSON.parse(candidate) as T;
}
