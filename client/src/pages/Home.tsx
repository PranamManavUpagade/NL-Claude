import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-medium text-amber-400">Calibrate</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">
        Evaluate AI outputs. You decide.
      </h1>
      <p className="mt-4 text-lg text-gray-400">
        Structured evaluation across correctness, completeness, reasoning,
        usefulness, and uncertainty — powered by Gemini 2.5 Flash on the server.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          to="/evaluate/new"
          className="rounded-lg bg-amber-500 px-5 py-2.5 font-medium text-black hover:bg-amber-400"
        >
          New evaluation
        </Link>
        <Link
          to="/dashboard"
          className="rounded-lg border border-gray-600 px-5 py-2.5 hover:border-gray-400"
        >
          Dashboard
        </Link>
      </div>
      <p className="mt-12 text-sm text-gray-500">
        API key stays on the server only — never in the React app.
      </p>
    </div>
  );
}
