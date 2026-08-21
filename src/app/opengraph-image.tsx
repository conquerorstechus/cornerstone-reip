import { generateBrandOgImage } from "../lib/og-brand-image";

export const runtime = "nodejs";
export const alt = "REIP · Real Estate Intelligence Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return generateBrandOgImage();
}
