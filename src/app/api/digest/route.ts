import { NextResponse } from "next/server";
import { getDigest, getLand, getProperties } from "@/lib/data";

export const runtime = "nodejs";

/** Live book snapshot: homes + land mapped from SAM_LIST_URL / local JSON. */
export async function GET() {
  const [digest, properties, land] = await Promise.all([
    getDigest(),
    getProperties(),
    getLand(),
  ]);
  return NextResponse.json({
    digest,
    properties,
    land,
    source: "remote",
  });
}
