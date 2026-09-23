import { notFound } from "next/navigation";
import { PicksList } from "../../../components/PicksList";
import { getDigest } from "../../../lib/data";
import { isPicksKind, PICKS_META, type PicksKind } from "../../../lib/picks";

export function generateStaticParams() {
  return [{ kind: "condos" }, { kind: "townhomes" }, { kind: "sfh" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!isPicksKind(kind)) return { title: "Picks" };
  return { title: PICKS_META[kind].title };
}

export default async function PicksKindPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind: raw } = await params;
  if (!isPicksKind(raw)) notFound();
  const kind = raw as PicksKind;
  const digest = await getDigest();
  const homeKind = PICKS_META[kind].homeKind;
  const deals = digest.deals.filter((d) => (d.homeKind ?? "sfh") === homeKind);

  return <PicksList kind={kind} deals={deals} dateLabel={digest.date} />;
}
