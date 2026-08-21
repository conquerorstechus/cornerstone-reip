import type { AnalysisRun } from "./types";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const FILE = path.join(process.cwd(), ".data", "runs.json");

async function load(): Promise<AnalysisRun[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    return JSON.parse(raw) as AnalysisRun[];
  } catch {
    return [];
  }
}

async function save(runs: AnalysisRun[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(runs, null, 2));
}

export async function listRuns() {
  const runs = await load();
  return runs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getRun(id: string) {
  const runs = await load();
  return runs.find((r) => r.id === id) ?? null;
}

export async function upsertRun(run: AnalysisRun) {
  const runs = await load();
  const i = runs.findIndex((r) => r.id === run.id);
  if (i >= 0) runs[i] = run;
  else runs.unshift(run);
  await save(runs.slice(0, 200));
  return run;
}
