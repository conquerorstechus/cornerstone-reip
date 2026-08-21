import type { Metadata } from "next";
import { Exo_2, Manrope } from "next/font/google";
import { AppShell } from "../components/AppShell";
import "./globals.css";

const exo = Exo_2({
  variable: "--font-exo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const SITE_NAME = "REIP";
const SITE_TITLE = "REIP · Real Estate Intelligence Platform";
const SITE_DESCRIPTION =
  "Cornerstone Digital Technologies — Real Estate Intelligence Platform for investors. Analyze areas, homes, land, and apartments.";

const PRODUCTION_APP_URL = "https://reip.csdigitaltech.com";

function metadataBaseUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    try {
      return new URL(configured);
    } catch {
      // Empty or invalid env values (common on Vercel) should not fail the build.
    }
  }

  if (process.env.NODE_ENV === "development") {
    return new URL("http://localhost:3000");
  }

  return new URL(PRODUCTION_APP_URL);
}

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: SITE_TITLE,
    template: "%s · REIP",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: { icon: "/logo.png" },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${exo.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-paper text-ink">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
