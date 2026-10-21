import { ImageResponse } from "next/og";
import { propertyById } from "./data";
import { listingHeadline, monthly, usd } from "./format";
import { generateBrandOgImage, OG_IMAGE_SIZE } from "./og-brand-image";
import type { HomeKind } from "./types";

const KIND_LABEL: Record<HomeKind, string> = {
  sfh: "Single Family Home",
  condo: "Condo",
  townhouse: "Townhome",
};

const KIND_COLOR: Record<HomeKind, string> = {
  sfh: "#1e40af",
  condo: "#7c3aed",
  townhouse: "#6d28d9",
};

/** Property share image, or the site card when that deal is not in the list. */
export async function generatePropertyOgImage(id: string) {
  const property = await propertyById(id);
  if (!property) return generateBrandOgImage();

  const kind = property.homeKind ?? "sfh";
  const accent = KIND_COLOR[kind];
  const headline = listingHeadline(property);
  const place = `${property.city}, ${property.state} ${property.zip}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#16171f",
          color: "#fffcf8",
        }}
      >
        <div style={{ width: 16, height: "100%", background: accent }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                color: accent,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 4,
              }}
            >
              {KIND_LABEL[kind].toUpperCase()}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              {headline}
            </div>
            <div style={{ display: "flex", marginTop: 16, fontSize: 28, color: "#b7aa9c" }}>
              {place} · Address on request
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 48 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 18, letterSpacing: 2, color: "#b7aa9c" }}>
                  ASKING
                </div>
                <div style={{ display: "flex", marginTop: 8, fontSize: 40, fontWeight: 700 }}>
                  {usd(property.ask)}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 18, letterSpacing: 2, color: "#b7aa9c" }}>
                  CASH FLOW
                </div>
                <div style={{ display: "flex", marginTop: 8, fontSize: 40, fontWeight: 700 }}>
                  {monthly(property.cashFlow)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, color: "#b7aa9c" }}>
              REIP
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE },
  );
}
