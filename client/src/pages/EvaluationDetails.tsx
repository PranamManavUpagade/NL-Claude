import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEvaluation, submitVerdict, type EvaluationResponse, type VerdictPayload } from '../services/api';
import analytics from '../services/analytics';
import EvaluationResults from '../components/EvaluationResults';
import TraceViewer from '../components/TraceViewer';
import CoachWidget from '../components/CoachWidget';

export default function EvaluationDetails() {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrace, setSelectedTrace] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<VerdictPayload>({
    trust_level: 'medium',
    action: 'use',
    rationale: '',
  });
  const [verdictResult, setVerdictResult] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!evaluationId) {
      setError('Missing evaluation ID.');
      setLoading(false);
      return;
    }

    getEvaluation(evaluationId)
      .then(setEvaluation)
      .catch(() => setError('Unable to load evaluation.'))
      .finally(() => setLoading(false));
  }, [evaluationId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!evaluationId) return;

    setSubmitting(true);
    setVerdictResult(null);

    if (verdict.rationale.trim().length < 20) {
      setVerdictResult('Rationale must be at least 20 characters.');
      setSubmitting(false);
      return;
    }

    try {
      const updated = await submitVerdict(evaluationId, verdict);
      setEvaluation(updated);
      setVerdictResult('Verdict saved successfully.');
      analytics.track('verdict_submitted', { evaluationId, trust_level: verdict.trust_level, action: verdict.action });
    } catch (err) {
      setVerdictResult(err instanceof Error ? err.message : 'Unable to save verdict.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDownload() {
    if (!evaluation) return;
    const blob = new Blob([JSON.stringify(evaluation, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calibrate-evaluation-${evaluation.evaluation_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Evaluation detail</h1>
          <p className="mt-2 text-sm text-slate-400">Inspect the full evaluation package and submit your final verdict.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            Back to dashboard
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!evaluation || !evaluation.verdict}
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export JSON
          </button>
        </div>
      </div>

      {loading && <p className="mt-6 text-slate-400">Loading evaluation...</p>}
      {error && <p className="mt-6 text-rose-400">{error}</p>}
      {evaluation && (
        <div className="mt-8 space-y-8">
          <CoachWidget evaluation={evaluation} />

          <EvaluationResults evaluation={evaluation} />

          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <h2 className="text-xl font-semibold text-white">Trace audit</h2>
            <p className="mt-2 text-sm text-slate-400">Open a trace to inspect the prompt and raw Gemini response for each dimension.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {evaluation.trace_ids.map((traceId) => (
                <button
                  key={traceId}
                  type="button"
                  onClick={() => setSelectedTrace(traceId)}
                  className="rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-amber-400"
                >
                  <p className="font-semibold text-white">Trace {traceId.slice(0, 8)}</p>
                  <p className="mt-1 text-slate-400">Open audit details</p>
                </button>
              ))}
            </div>
          </section>

          {selectedTrace && <TraceViewer traceId={selectedTrace} onClose={() => setSelectedTrace(null)} />}

          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <h2 className="text-xl font-semibold text-white">Verdict gate</h2>
            <p className="mt-2 text-sm text-slate-400">Submit your final decision before sharing or acting on the output.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">Trust level</span>
                  <select
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                    value={verdict.trust_level}
                    onChange={(e) => setVerdict((prev) => ({ ...prev, trust_level: e.target.value as VerdictPayload['trust_level'] }))}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">Action</span>
                  <select
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                    value={verdict.action}
                    onChange={(e) => setVerdict((prev) => ({ ...prev, action: e.target.value as VerdictPayload['action'] }))}
                  >
                    <option value="use">Use</option>
                    <option value="revise">Revise</option>
                    <option value="discard">Discard</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-300">Rationale</span>
                <textarea
                  className="mt-2 min-h-[120px] w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-4 text-sm text-white outline-none transition focus:border-amber-400"
                  value={verdict.rationale}
                  onChange={(e) => setVerdict((prev) => ({ ...prev, rationale: e.target.value }))}
                  placeholder="Explain why you trust or do not trust this output..."
                  required
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Saving verdict...' : 'Submit verdict'}
              </button>
            </form>
            {verdictResult && <p className="mt-4 text-sm text-slate-300">{verdictResult}</p>}
            {evaluation.verdict && (
              <div className="mt-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <p className="font-semibold">Latest verdict</p>
                <p>Trust level: {evaluation.verdict.trust_level}</p>
                <p>Action: {evaluation.verdict.action}</p>
                <p>Rationale: {evaluation.verdict.rationale}</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
