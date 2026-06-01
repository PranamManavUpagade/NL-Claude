import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHealth, getEvaluations, type EvaluationSummary, type HealthResponse } from '../services/api';

export default function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setError('Cannot reach API. Run npm run dev from project root.'));

    getEvaluations()
      .then(setEvaluations)
      .catch(() => setError('Unable to load evaluations.'));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-gray-400">System status, evaluation history, and quick access.</p>
        </div>
        <Link
          to="/evaluate/new"
          className="rounded-lg bg-amber-500 px-5 py-2.5 font-medium text-black hover:bg-amber-400"
        >
          New evaluation
        </Link>
      </div>

      {error && <p className="mt-6 text-red-400">{error}</p>}

      {health && (
        <div className="mt-6 rounded-3xl border border-gray-700 bg-gray-900 p-6 shadow-xl shadow-black/20">
          <p>
            API: <span className="text-green-400">{health.status}</span>
          </p>
          <p className="mt-2">
            LLM: <span className="text-amber-400">{health.llm}</span>
          </p>
          <p className="mt-2">
            Gemini key configured:{' '}
            <span className={health.geminiConfigured ? 'text-green-400' : 'text-red-400'}>
              {health.geminiConfigured ? 'Yes' : 'No — add GEMINI_API_KEY in server/.env'}
            </span>
          </p>
        </div>
      )}

      <section className="mt-8 rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20">
        <h2 className="text-xl font-semibold text-white">Recent evaluations</h2>
        {evaluations.length === 0 ? (
          <p className="mt-4 text-slate-400">No evaluations have been created yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {evaluations.map((evaluation) => (
              <Link
                key={evaluation.evaluation_id}
                to={`/evaluate/${evaluation.evaluation_id}`}
                className="block rounded-3xl border border-white/10 bg-slate-900/80 p-4 transition hover:border-amber-400"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">{evaluation.model}</p>
                    <p className="text-sm text-slate-400">{new Date(evaluation.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">{evaluation.status}</span>
                    {evaluation.verdict ? (
                      <span className="rounded-full bg-emerald-800 px-3 py-1 text-emerald-200">Verdict: {evaluation.verdict.action}</span>
                    ) : (
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">Awaiting verdict</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
