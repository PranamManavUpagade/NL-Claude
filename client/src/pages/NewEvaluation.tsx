import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvaluation, type EvaluationResponse } from '../services/api';
import analytics from '../services/analytics';
import EvaluationResults from '../components/EvaluationResults';

export default function NewEvaluation() {
  const navigate = useNavigate();
  const [aiOutput, setAiOutput] = useState('');
  const [userIntent, setUserIntent] = useState('');
  const [stakes, setStakes] = useState(3);
  const [domain, setDomain] = useState<'research' | 'writing' | 'career' | 'general'>('general');
  const [mode, setMode] = useState<'quick' | 'deep'>('quick');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEvaluation(null);
    analytics.track('evaluation_start', { domain, mode, stakes });

    try {
      const data = await createEvaluation({
        ai_output: aiOutput,
        user_intent: userIntent,
        stakes_level: stakes,
        domain,
        mode,
      });
      setEvaluation(data);
      analytics.track('evaluation_complete', { evaluationId: data.evaluation_id });
      navigate(`/evaluate/${data.evaluation_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
          <div className="xl:w-2/3">
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-black/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Claude-style evaluation</p>
                  <h1 className="mt-3 text-3xl font-bold text-white">Calibrate your AI output</h1>
                  <p className="mt-3 text-slate-400">
                    Paste the generated output, define the goal, and inspect each dimension with an evaluation-first interface.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/90 px-4 py-3 text-sm text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  Live evaluation
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">Your goal</span>
                    <input
                      className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400"
                      value={userIntent}
                      onChange={(e) => setUserIntent(e.target.value)}
                      placeholder="Summarize key findings for a research memo"
                      required
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-300">Stakes</span>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400"
                        value={stakes}
                        onChange={(e) => setStakes(Number(e.target.value))}
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-300">Mode</span>
                      <select
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400"
                        value={mode}
                        onChange={(e) => setMode(e.target.value as typeof mode)}
                      >
                        <option value="quick">Quick</option>
                        <option value="deep">Deep</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium text-slate-300">Domain</span>
                      <select
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value as typeof domain)}
                      >
                        <option value="general">General</option>
                        <option value="research">Research</option>
                        <option value="writing">Writing</option>
                        <option value="career">Career</option>
                      </select>
                    </label>
                  </div>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-slate-300">AI output</span>
                  <textarea
                    className="mt-2 min-h-[240px] w-full rounded-[1.5rem] border border-white/10 bg-slate-950 px-4 py-4 text-sm text-slate-100 outline-none transition focus:border-amber-400"
                    value={aiOutput}
                    onChange={(e) => setAiOutput(e.target.value)}
                    placeholder="Paste the AI-generated text here..."
                    required
                  />
                </label>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-400">
                    Gemini 2.5 Flash powers the backend evaluation — the browser only sends the AI output and intent.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Evaluating...' : 'Run evaluation'}
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                  {error}
                </div>
              )}
            </div>
          </div>

          <aside className="xl:w-1/3">
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">How it works</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">Evaluation flow</h2>
              <ul className="mt-5 space-y-4 text-sm text-slate-300">
                <li className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                  <strong className="block text-slate-100">1. Paste output</strong>
                  Use the text area to add the complete AI answer you want to vet.
                </li>
                <li className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                  <strong className="block text-slate-100">2. Define intent</strong>
                  Tell Calibrate what the output should accomplish and how important it is.
                </li>
                <li className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                  <strong className="block text-slate-100">3. Review dimensions</strong>
                  Inspect correctness, completeness, reasoning, usefulness, and uncertainty.
                </li>
                <li className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                  <strong className="block text-slate-100">4. Decide</strong>
                  Use the verdict gate to export only when the evaluation is complete.
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {evaluation && (
          <div className="mt-10">
            <EvaluationResults evaluation={evaluation} />
          </div>
        )}
      </div>
    </div>
  );
}
