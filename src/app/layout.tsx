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

export const metadata: Metadata = {
  title: {
    default: "RIP · Real Estate Intelligence Platform",
    template: "%s · RIP",
  },
  description:
    "Cornerstone Digital Technologies — analyze areas, properties, land, and multifamily with n8n-backed underwriting.",
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
