import { WORKFLOWS } from "../../lib/n8n";
import { webhookForType } from "../../lib/analysis";
import { listRuns } from "../../lib/store";
import { TriggerButton } from "./TriggerButton";

export const metadata = { title: "n8n Workflows" };

export default async function WorkflowsPage() {
  const runs = (await listRuns()).slice(0, 12);
  const base = process.env.N8N_BASE_URL ?? "";
  const secretSet = Boolean(process.env.N8N_SHARED_SECRET);

  return (
    <div className="space-y-8">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">AUTOMATION</p>
        <h2 className="display mt-1 text-3xl font-semibold">n8n workflows</h2>
        <p className="mt-2 max-w-2xl text-sm text-taupe">
          RIP treats n8n as the orchestrator — scrape, enrich, email — and keeps underwriting math
          in this app. Import the JSON files from <code className="text-ink">n8n/workflows/</code>,
          set <code className="text-ink">APP_BASE_URL</code> and{" "}
          <code className="text-ink">N8N_SHARED_SECRET</code>, then paste each production webhook
          URL into <code className="text-ink">.env.local</code>.
        </p>
      </div>

      <dl className="grid gap-px bg-line ring-1 ring-line sm:grid-cols-3">
        <div className="bg-cream px-5 py-4">
          <dt className="display text-[10px] tracking-[0.18em] text-taupe">N8N_BASE_URL</dt>
          <dd className="mt-1 text-sm font-semibold">{base || "not set"}</dd>
        </div>
        <div className="bg-cream px-5 py-4">
          <dt className="display text-[10px] tracking-[0.18em] text-taupe">SHARED SECRET</dt>
          <dd className="mt-1 text-sm font-semibold">{secretSet ? "configured" : "not set"}</dd>
        </div>
        <div className="bg-cream px-5 py-4">
          <dt className="display text-[10px] tracking-[0.18em] text-taupe">CALLBACK</dt>
          <dd className="mt-1 text-sm font-semibold">POST /api/webhooks/n8n</dd>
        </div>
      </dl>

      <ul className="divide-y divide-stone bg-cream ring-1 ring-line">
        {WORKFLOWS.map((w) => {
          const url = webhookForType(w.id);
          return (
            <li key={w.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="display text-sm font-semibold tracking-wide">{w.name}</p>
                <p className="mt-1 text-sm text-taupe">{w.description}</p>
                <p className="mt-1 text-xs text-taupe">
                  {w.file} · {w.env}: {url ? "webhook set" : "missing — local fallback"}
                </p>
              </div>
              <TriggerButton id={w.id} />
            </li>
          );
        })}
      </ul>

      <section>
        <h3 className="display mb-3 text-xl font-semibold">Recent runs</h3>
        {runs.length === 0 ? (
          <p className="text-sm text-taupe">No runs yet.</p>
        ) : (
          <ul className="divide-y divide-stone bg-cream text-sm ring-1 ring-line">
            {runs.map((r) => (
              <li key={r.id} className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                <span>
                  {r.query}{" "}
                  <span className="text-taupe">
                    ({r.type} · {r.source})
                  </span>
                </span>
                <span className="display text-[10px] tracking-[0.16em] text-taupe">{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-navy p-6 text-cream">
        <h3 className="display text-lg font-semibold">Handshake</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-taupe-2">
          <li>Import each file in n8n/workflows via Workflows → Import from File.</li>
          <li>
            Set n8n env vars <code className="text-cream">APP_BASE_URL</code> and{" "}
            <code className="text-cream">N8N_SHARED_SECRET</code> (must match this app).
          </li>
          <li>Activate the workflow. Copy the production webhook URL into .env.local.</li>
          <li>
            RIP POSTs jobs with <code className="text-cream">x-webhook-secret</code>. n8n POSTs
            results back to /api/webhooks/n8n with the same header and a <code className="text-cream">runId</code>.
          </li>
          <li>If a webhook is missing or n8n is down, RIP runs the local underwriting engine.</li>
        </ol>
      </section>
    </div>
  );
}
