import { notFound } from "next/navigation";
import { ReportView } from "../../../components/ReportView";
import { getRun } from "../../../lib/store";
import { RunPoller } from "./RunPoller";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const run = await getRun(id);
  if (!run) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <p className="display text-[11px] tracking-[0.24em] text-taupe">
        {run.type.toUpperCase()} · {run.source.toUpperCase()} · {run.status.toUpperCase()} ·{" "}
        {new Date(run.createdAt).toLocaleString()}
      </p>
      {run.status === "queued" || run.status === "running" ? (
        <div className="bg-cream px-6 py-10 text-center ring-1 ring-line">
          <p className="display text-lg font-semibold">Waiting on n8n</p>
          <p className="mt-2 text-sm text-taupe">
            Job {run.id} was posted to the workflow webhook. This page refreshes when the callback
            hits <code>/api/webhooks/n8n</code>.
          </p>
          <RunPoller id={run.id} />
        </div>
      ) : null}
      {run.error ? <p className="text-sm text-danger">{run.error}</p> : null}
      {run.result ? <ReportView result={run.result} /> : null}
    </div>
  );
}
