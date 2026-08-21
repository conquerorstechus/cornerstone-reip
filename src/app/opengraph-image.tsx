import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "REIP · Real Estate Intelligence Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#16171f",
        }}
      >
        <div style={{ width: 16, height: "100%", background: "#e21880" }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 64,
          }}
        >
          <div
            style={{
              display: "flex",
              background: "#fffcf8",
              padding: "36px 56px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img src={logoSrc} alt="" width={900} height={180} />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#fffcf8",
                fontSize: 64,
                fontWeight: 700,
                letterSpacing: 12,
              }}
            >
              REIP
            </div>
            <div
              style={{
                display: "flex",
                color: "#b7aa9c",
                fontSize: 22,
                letterSpacing: 6,
                marginTop: 12,
              }}
            >
              REAL ESTATE INTELLIGENCE PLATFORM
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
