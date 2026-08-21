import { AnalyzeForm } from "../../components/AnalyzeForm";

export const metadata = { title: "Analyze" };

export default function AnalyzePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">UNDERWRITE</p>
        <h2 className="display mt-1 text-3xl font-semibold">Run an analysis</h2>
        <p className="mt-2 text-sm text-taupe">
          Local engine uses the High ROI Picks stack (7% / 30-year / 50% down). If n8n webhooks are
          configured, RIP posts the job and waits for the callback at{" "}
          <code className="text-ink">/api/webhooks/n8n</code>.
        </p>
      </div>
      <AnalyzeForm />
    </div>
  );
}
