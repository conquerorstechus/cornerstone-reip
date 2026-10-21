import { generateLandOgImage } from "../../../lib/og-property-image";

export const runtime = "nodejs";
export const alt = "REIP land preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function LandOpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return generateLandOgImage(id);
}
