export function Kpi({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "magenta" | "blue" | "taupe";
}) {
  const bar =
    accent === "magenta"
      ? "bg-magenta"
      : accent === "blue"
        ? "bg-blue"
        : "bg-taupe";
  return (
    <div className="relative overflow-hidden bg-cream p-4 ring-1 ring-line sm:p-5">
      <div className={`absolute inset-y-0 left-0 w-[3px] ${bar}`} />
      <p className="display text-[10px] tracking-[0.22em] text-taupe">{label}</p>
      <p className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-taupe">{hint}</p> : null}
    </div>
  );
}

export function ScoreBar({ score, label = "Investor score" }: { score: number; label?: string }) {
  const color = score >= 80 ? "bg-success" : score >= 65 ? "bg-blue" : "bg-warn";
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="display text-[10px] tracking-[0.2em] text-taupe">{label}</span>
        <span className="font-display text-lg font-semibold">{score}</span>
      </div>
      <div className="h-1.5 bg-stone">
        <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function RecBadge({ rec }: { rec: "pursue" | "watch" | "pass" }) {
  const cls =
    rec === "pursue"
      ? "bg-success/12 text-success"
      : rec === "watch"
        ? "bg-warn/12 text-warn"
        : "bg-danger/12 text-danger";
  return (
    <span className={`display px-2 py-1 text-[10px] tracking-[0.18em] uppercase ${cls}`}>
      {rec}
    </span>
  );
}

export function TableScroll({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto overscroll-x-contain">{children}</div>;
}

export function SectionTitle({ kicker, title }: { kicker?: string; title: string }) {
  return (
    <div className="mb-4">
      {kicker ? (
        <p className="display text-[10px] tracking-[0.28em] text-magenta">{kicker}</p>
      ) : null}
      <h2 className="display text-xl font-semibold tracking-[0.06em]">{title}</h2>
    </div>
  );
}
