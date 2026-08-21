import type { AnalysisResult } from "../lib/types";
import { monthly, usd } from "../lib/format";
import { RecBadge, ScoreBar } from "./Ui";

export function ReportView({ result }: { result: AnalysisResult }) {
  return (
    <article className="bg-cream ring-1 ring-line">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <p className="display text-[10px] tracking-[0.26em] text-magenta">ANALYSIS REPORT</p>
          <h2 className="display mt-1 text-2xl font-semibold tracking-wide">{result.title}</h2>
          <p className="mt-1 text-sm text-taupe">{result.subtitle}</p>
        </div>
        <div className="w-48">
          <RecBadge rec={result.recommendation} />
          <div className="mt-3">
            <ScoreBar score={result.investorScore} />
          </div>
        </div>
      </header>
      <p className="border-b border-line px-6 py-4 text-sm leading-relaxed">{result.summary}</p>
      <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-5">
        {result.metrics.map((m) => (
          <div key={m.label} className="bg-cream px-4 py-3">
            <dt className="display text-[9px] tracking-[0.16em] text-taupe">{m.label}</dt>
            <dd className="mt-1 text-sm font-semibold">{m.value}</dd>
            {m.hint ? <p className="mt-0.5 text-[11px] text-taupe">{m.hint}</p> : null}
          </div>
        ))}
      </dl>
      {result.cashFlow ? (
        <div className="border-t border-line px-6 py-5">
          <p className="display text-[10px] tracking-[0.22em] text-taupe">MONTHLY CASH FLOW</p>
          <p className="mt-1 text-xs text-taupe">
            Cash flow is rent minus tax, HOA, and insurance. Mortgage is shown separately (7% /
            30-year / 50% down).
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Row k="Ask" v={usd(result.cashFlow.ask)} />
            <Row k="Offer" v={usd(result.cashFlow.offer)} />
            <Row k="Rent (est.)" v={monthly(result.cashFlow.rent)} />
            <Row k="Tax" v={`− ${monthly(result.cashFlow.tax)}`} />
            <Row k="HOA" v={`− ${monthly(result.cashFlow.hoa)}`} />
            <Row k="Insurance" v={`− ${monthly(result.cashFlow.insurance)}`} />
            <Row k="Cash flow" v={monthly(result.cashFlow.noi)} strong />
            <Row k="Mortgage" v={`− ${monthly(result.cashFlow.mortgage)}`} />
            <Row k="After the mortgage" v={monthly(result.cashFlow.afterDebt)} strong />
          </div>
        </div>
      ) : null}
      {result.sections.map((s) => (
        <section key={s.heading} className="border-t border-line px-6 py-5">
          <h3 className="display text-sm font-semibold tracking-[0.08em]">{s.heading}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/85">{s.body}</p>
          {s.bullets ? (
            <ul className="mt-3 space-y-1.5 text-sm text-ink/80">
              {s.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-magenta" />
                  {b}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </article>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between border-b border-stone py-1.5 text-sm ${strong ? "font-semibold" : ""}`}>
      <span className="text-taupe">{k}</span>
      <span>{v}</span>
    </div>
  );
}
