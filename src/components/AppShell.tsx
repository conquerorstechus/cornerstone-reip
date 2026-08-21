"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Layers,
  LayoutDashboard,
  MapPinned,
  ScanSearch,
  Trees,
  FileBarChart,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "High ROI Picks", icon: FileBarChart },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/areas", label: "Areas", icon: MapPinned },
  { href: "/land", label: "Land", icon: Trees },
  { href: "/multifamily", label: "Multifamily", icon: Layers },
  { href: "/analyze", label: "Analyze", icon: ScanSearch },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="no-print sticky top-0 flex h-screen w-[248px] shrink-0 flex-col bg-navy text-cream">
        <Link href="/" className="border-b border-white/10 px-5 py-5">
          <Image
            src="/logo.png"
            alt="Cornerstone Digital Technologies"
            width={640}
            height={220}
            className="h-auto w-full"
            priority
          />
          <p className="display mt-3 text-[11px] tracking-[0.28em] text-taupe-2">
            REAL ESTATE INTELLIGENCE
          </p>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {NAV.map((item) => {
            const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm tracking-wide ${
                  active
                    ? "bg-white/10 text-cream"
                    : "text-taupe-2 hover:bg-white/5 hover:text-cream"
                }`}
              >
                <Icon
                  size={16}
                  className={active ? "text-magenta" : "text-taupe"}
                  strokeWidth={1.75}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-[11px] leading-relaxed text-taupe">
          <p className="display tracking-[0.18em] text-taupe-2">REIP</p>
          <p className="mt-1">Cornerstone Digital Technologies</p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print flex items-center justify-between border-b border-line bg-cream px-8 py-4">
          <div>
            <p className="display text-[11px] tracking-[0.32em] text-taupe">
              CORNERSTONE <span className="wordmark-n">N</span>
              <span className="wordmark-e">E</span>
              <span className="wordmark-stone"> DIGITAL</span>
            </p>
            <h1 className="display mt-0.5 text-lg font-semibold tracking-[0.12em]">
              REIP
              <span className="ml-3 text-sm font-medium tracking-normal text-taupe">
                Real Estate Intelligence Platform
              </span>
            </h1>
          </div>
          <Link
            href="/analyze"
            className="bg-magenta px-4 py-2 text-sm font-semibold tracking-wide text-white hover:bg-magenta-dark"
          >
            New analysis
          </Link>
        </header>
        <main className="flex-1 px-8 py-7">{children}</main>
      </div>
    </div>
  );
}
