import { notFound } from "next/navigation";
import { ReportView } from "../../../components/ReportView";
import { getRun } from "../../../lib/store";

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
        {new Date(run.createdAt).toLocaleString()}
      </p>
      {run.error ? <p className="text-sm text-danger">{run.error}</p> : null}
      {run.result ? <ReportView result={run.result} /> : null}
    </div>
  );
}
