interface DimensionCardProps {
  title: string;
  subtitle: string;
  items: string[];
  accent: string;
}

export default function DimensionCard({ title, subtitle, items, accent }: DimensionCardProps) {
  const visibleItems = items.filter((item) => item.trim().length > 0);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${accent} bg-white/5`}>
          {visibleItems.length}
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {visibleItems.length > 0 ? (
          visibleItems.map((item, index) => (
            <div key={index} className="rounded-2xl border border-white/5 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
              {item}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No signals generated yet.</p>
        )}
      </div>
    </div>
  );
}
