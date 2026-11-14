"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Calculator, Calendar, Home, MapPinned, Menu, ScanSearch, X } from "lucide-react";
import { MarketSelect } from "./MarketSelect";
import { SiteDisclaimerFooter } from "./Disclaimer";

const NAV_MAIN: { href: string; label: string; short: string; icon: typeof Home }[] = [
  { href: "/", label: "Deals", short: "Deals", icon: Home },
  { href: "/events", label: "Events", short: "Events", icon: Calendar },
  { href: "/mortgage", label: "Mortgage calc", short: "Loan", icon: Calculator },
  { href: "/areas", label: "Areas", short: "Areas", icon: MapPinned },
  { href: "/analyze", label: "Analyze", short: "Analyze", icon: ScanSearch },
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
      <aside className="no-print sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-line bg-white lg:flex">
        <SidebarBrand />
        <NavLinks path={path} />
        <SidebarFooter />
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="no-print fixed inset-0 z-40 bg-navy/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        id={menuId}
        className={`no-print fixed inset-y-0 left-0 z-50 flex w-[min(20rem,88vw)] flex-col bg-white shadow-2xl transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
        inert={!open}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="eyebrow">Menu</p>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="flex h-11 w-11 items-center justify-center text-navy"
          >
            <X size={22} strokeWidth={1.75} />
          </button>
        </div>
        <NavLinks path={path} onNavigate={() => setOpen(false)} />
        <SidebarFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0">
        <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-white/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md lg:static lg:justify-end lg:px-8 lg:py-3 lg:pt-3 lg:backdrop-blur-none">
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
              <Image
                src="/logo.png"
                alt="Cornerstone Digital Technologies"
                width={320}
                height={64}
                className="h-8 w-auto max-w-[min(12rem,52vw)]"
                priority
              />
            </Link>
          </div>
          <MarketSelect />
        </header>
        <main className="min-w-0 flex-1 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          {children}
        </main>
        <SiteDisclaimerFooter />
      </div>

      <nav
        aria-label="Primary"
        className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5">
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
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold tracking-wide ${
                  active ? "text-magenta" : "text-taupe"
                }`}
              >
                <Icon size={20} strokeWidth={1.75} />
                {item.short}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function SidebarBrand() {
  return (
    <Link href="/" className="block px-5 pt-6 pb-4">
      <Image
        src="/logo.png"
        alt="Cornerstone Digital Technologies"
        width={640}
        height={220}
        className="h-auto w-full"
        priority
      />
      <p className="eyebrow mt-3">Real Estate Intelligence</p>
    </Link>
  );
}

function NavLinks({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
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
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
              active ? "bg-navy text-white" : "text-taupe hover:bg-paper hover:text-navy"
            }`}
          >
            <Icon size={17} className={active ? "text-magenta" : ""} strokeWidth={1.9} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="px-5 py-4">
      <Link href="/disclaimers" className="text-xs text-taupe underline-offset-2 hover:text-navy hover:underline">
        Disclaimers
      </Link>
    </div>
  );
}
