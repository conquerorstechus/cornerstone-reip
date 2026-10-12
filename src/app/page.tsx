import { PicksBrowser } from "../components/PicksBrowser";
import { getDigest, getLand } from "../lib/data";
import { isDealView, PICKS_META, type DealView } from "../lib/picks";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const sp = await searchParams;
  const initial: DealView = isDealView(sp.view ?? "") ? (sp.view as DealView) : "condos";
  const [digest, land] = await Promise.all([getDigest(), getLand()]);
  const groups = {
    condos: digest.deals.filter((d) => d.homeKind === PICKS_META.condos.homeKind),
    townhomes: digest.deals.filter((d) => d.homeKind === PICKS_META.townhomes.homeKind),
    sfh: digest.deals.filter((d) => (d.homeKind ?? "sfh") === PICKS_META.sfh.homeKind),
  };

  return <PicksBrowser groups={groups} land={land} dateLabel={digest.date} initial={initial} />;
}
