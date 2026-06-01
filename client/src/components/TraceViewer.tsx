import { useEffect, useState } from 'react';
import { getTrace, type TraceRecord } from '../services/api';
import analytics from '../services/analytics';

interface TraceViewerProps {
  traceId: string;
  onClose: () => void;
}

export default function TraceViewer({ traceId, onClose }: TraceViewerProps) {
  const [trace, setTrace] = useState<TraceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getTrace(traceId)
      .then(setTrace)
      .catch(() => setError('Unable to load trace details.'))
      .finally(() => {
        analytics.track('trace_open', { traceId });
      })
      .finally(() => setLoading(false));
  }, [traceId]);

  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-xl shadow-black/30">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Trace detail</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Trace ID: {traceId}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          Close
        </button>
      </div>

      {loading && <p className="mt-4 text-slate-400">Loading trace...</p>}
      {error && <p className="mt-4 text-rose-400">{error}</p>}
      {trace && (
        <div className="mt-4 space-y-4 text-sm text-slate-200">
          <div>
            <p className="text-slate-400">Dimension</p>
            <p className="rounded-3xl bg-slate-900 p-4 text-slate-100">{trace.dimension}</p>
          </div>
          <div>
            <p className="text-slate-400">Prompt</p>
            <pre className="max-h-72 overflow-auto rounded-3xl bg-slate-900 p-4 text-xs leading-5 text-slate-100">{trace.prompt}</pre>
          </div>
          <div>
            <p className="text-slate-400">Raw response</p>
            <pre className="max-h-72 overflow-auto rounded-3xl bg-slate-900 p-4 text-xs leading-5 text-slate-100">{trace.raw_response}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
