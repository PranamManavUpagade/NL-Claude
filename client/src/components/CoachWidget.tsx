import { type EvaluationResponse } from '../services/api';

interface CoachWidgetProps {
  evaluation: EvaluationResponse | null;
}

export default function CoachWidget({ evaluation }: CoachWidgetProps) {
  return (
    <aside className="rounded-2xl border border-white/6 bg-slate-900/80 p-4">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Coach</p>
      <h3 className="mt-2 text-lg font-semibold text-white">Calibration coach (preview)</h3>
      <p className="mt-2 text-sm text-slate-400">The coach learns from your verdicts and suggests focus areas after several sessions.</p>
      <div className="mt-3 text-sm text-slate-300">
        <p><strong>Session:</strong> {evaluation ? '1 evaluation (preview)' : 'No session yet'}</p>
        <p className="mt-2">Next: Submit verdict to train the coach.</p>
      </div>
    </aside>
  );
}
