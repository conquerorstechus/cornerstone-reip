"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RunPoller({ id }: { id: string }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(async () => {
      const res = await fetch(`/api/n8n/runs?id=${id}`, { cache: "no-store" });
      const json = await res.json();
      if (json.run && json.run.status !== "queued" && json.run.status !== "running") {
        router.refresh();
      }
    }, 2500);
    return () => clearInterval(t);
  }, [id, router]);
  return <p className="mt-4 text-xs tracking-wide text-taupe">Polling every 2.5s…</p>;
}
