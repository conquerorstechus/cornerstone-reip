"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import {
  Building2,
  FileBarChart,
  HardHat,
  Home,
  Layers,
  LayoutDashboard,
  MapPinned,
  Menu,
  ScanSearch,
  Store,
  Trees,
  X,
} from "lucide-react";
import { MarketSelect } from "./MarketSelect";
import { SiteDisclaimerFooter } from "./Disclaimer";

const NAV_MAIN: { href: string; label: string; icon: typeof LayoutDashboard }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/picks/condos", label: "Condos", icon: Building2 },
  { href: "/picks/townhomes", label: "Townhomes", icon: Layers },
  { href: "/picks/sfh", label: "Single Family", icon: Home },
  { href: "/land", label: "Land", icon: Trees },
  { href: "/areas", label: "Areas", icon: MapPinned },
  { href: "/analyze", label: "Analyze", icon: ScanSearch },
];

const NAV_SOON: { href: string; label: string; icon: typeof LayoutDashboard }[] = [
  { href: "/multifamily", label: "Multifamily", icon: FileBarChart },
  { href: "/commercial", label: "Commercial", icon: Building2 },
  { href: "/businesses", label: "Businesses for sale", icon: Store },
  { href: "/contractors", label: "Contractors", icon: HardHat },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="flex min-h-dvh">
      <aside className="no-print sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col bg-navy text-cream lg:flex">
        <SidebarBrand />
        <NavLinks path={path} />
        <SidebarFooter />
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="no-print fixed inset-0 z-40 bg-navy/55 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        id={menuId}
        className={`no-print fixed inset-y-0 left-0 z-50 flex w-[min(20rem,88vw)] flex-col bg-navy text-cream shadow-2xl transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
        inert={!open}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="display text-[11px] tracking-[0.28em] text-taupe-2">MENU</p>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="flex h-11 w-11 items-center justify-center text-cream"
          >
            <X size={22} strokeWidth={1.75} />
          </button>
        </div>
        <NavLinks path={path} onNavigate={() => setOpen(false)} />
        <SidebarFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-cream/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md lg:static lg:px-8 lg:py-4 lg:pt-4 lg:backdrop-blur-none">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center text-navy lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((v) => !v)}
            >
              <Menu size={22} strokeWidth={1.75} />
            </button>
            <Link href="/" className="min-w-0 lg:hidden">
              <span className="display text-base font-semibold tracking-[0.14em] sm:hidden">REIP</span>
              <Image
                src="/logo.png"
                alt="Cornerstone Digital Technologies"
                width={320}
                height={64}
                className="hidden h-8 w-auto max-w-[min(12rem,48vw)] sm:block"
                priority
              />
            </Link>
            <div className="hidden min-w-0 lg:block">
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
          </div>
          <MarketSelect />
        </header>
        <main className="min-w-0 flex-1 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          {children}
        </main>
        <SiteDisclaimerFooter />
      </div>
    </div>
  );
}

function SidebarBrand() {
  return (
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
  );
}

function NavLinks({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
      {NAV_MAIN.map((item) => {
        const active =
          item.href === "/"
            ? path === "/"
            : path === item.href || path.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm tracking-wide ${
              active
                ? "bg-white/10 text-cream"
                : "text-taupe-2 hover:bg-white/5 hover:text-cream"
            }`}
          >
            <Icon size={16} className={active ? "text-magenta" : "text-taupe"} strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
      <p className="display mt-4 px-3 pb-1 text-[9px] tracking-[0.2em] text-taupe/45">COMING SOON</p>
      {NAV_SOON.map((item) => {
        const Icon = item.icon;
        return (
          <span
            key={item.href}
            className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 text-sm tracking-wide text-taupe/45"
            aria-disabled="true"
          >
            <Icon size={16} className="text-taupe/40" strokeWidth={1.75} />
            <span className="flex-1">{item.label}</span>
            <span className="display text-[9px] tracking-[0.16em] text-taupe/50">SOON</span>
          </span>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-white/10 px-5 py-4 text-[11px] leading-relaxed text-taupe">
      <p className="display tracking-[0.18em] text-taupe-2">REIP</p>
      <p className="mt-1">Cornerstone Digital Technologies</p>
      <Link
        href="/disclaimers"
        className="mt-3 inline-block text-[10px] tracking-wide text-taupe-2 underline hover:text-cream"
      >
        Disclaimers
      </Link>
    </div>
  );
}
