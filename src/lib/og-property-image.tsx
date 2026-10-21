import { ImageResponse } from "next/og";
import { landById, mfById, propertyById } from "./data";
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

function dealShareImage(card: {
  kicker: string;
  accent: string;
  headline: string;
  subline: string;
  stats: { label: string; value: string }[];
}) {
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
        <div style={{ width: 16, height: "100%", background: card.accent }} />
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
                color: card.accent,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 4,
              }}
            >
              {card.kicker}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontSize: 56,
                fontWeight: 700,
                lineHeight: 1.15,
                maxWidth: 1000,
              }}
            >
              {card.headline}
            </div>
            <div style={{ display: "flex", marginTop: 16, fontSize: 28, color: "#b7aa9c" }}>
              {card.subline}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 48 }}>
              {card.stats.map((stat) => (
                <div key={stat.label} style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: 18, letterSpacing: 2, color: "#b7aa9c" }}>
                    {stat.label}
                  </div>
                  <div style={{ display: "flex", marginTop: 8, fontSize: 40, fontWeight: 700 }}>
                    {stat.value}
                  </div>
                </div>
              ))}
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

/** Home share image, or the site card when that deal is not in the list. */
export async function generatePropertyOgImage(id: string) {
  const property = await propertyById(id);
  if (!property) return generateBrandOgImage();

  const kind = property.homeKind ?? "sfh";
  return dealShareImage({
    kicker: KIND_LABEL[kind].toUpperCase(),
    accent: KIND_COLOR[kind],
    headline: listingHeadline(property),
    subline: `${property.city}, ${property.state} ${property.zip} · Address on request`,
    stats: [
      { label: "ASKING", value: usd(property.ask) },
      { label: "CASH FLOW", value: monthly(property.cashFlow) },
    ],
  });
}

/** Land share image, or the site card when that lot is not in the list. */
export async function generateLandOgImage(id: string) {
  const parcel = await landById(id);
  if (!parcel) return generateBrandOgImage();

  const lot =
    parcel.acres > 0
      ? `${parcel.acres.toFixed(2)} acres`
      : parcel.lotSqft
        ? `${parcel.lotSqft.toLocaleString()} sqft`
        : "Lot";

  return dealShareImage({
    kicker: "LAND",
    accent: "#0d9488",
    headline: `${lot} · ${parcel.city}`,
    subline: `${parcel.city}, FL ${parcel.zip} · Address on request`,
    stats: [
      { label: "ASKING", value: usd(parcel.asking) },
      { label: "CASH FLOW", value: monthly(parcel.cashFlow ?? 0) },
    ],
  });
}

/** Multifamily share image, or the site card when that asset is not in the list. */
export async function generateMultifamilyOgImage(id: string) {
  const asset = mfById(id);
  if (!asset) return generateBrandOgImage();

  return dealShareImage({
    kicker: "MULTIFAMILY",
    accent: "#e21880",
    headline: asset.name,
    subline: `${asset.city}, FL ${asset.zip} · ${asset.units} units`,
    stats: [
      { label: "ASKING", value: usd(asset.asking) },
      { label: "PER UNIT", value: usd(asset.pricePerUnit) },
    ],
  });
}
