import { redirect } from "next/navigation";
import { isPicksKind } from "../../../lib/picks";

export default async function PicksKindPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!isPicksKind(kind)) redirect("/");
  redirect(kind === "condos" ? "/" : `/?view=${kind}`);
}
