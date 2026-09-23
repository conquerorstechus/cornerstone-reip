import Link from "next/link";
import { DISCLAIMER_PATH, DISCLAIMER_SHORT } from "../lib/disclaimers";

/** Compact disclaimer with link to the full legal page. */
export function DisclaimerNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-relaxed text-[#6b7280] ${className}`}>
      {DISCLAIMER_SHORT}{" "}
      <Link href={DISCLAIMER_PATH} className="font-semibold text-[#1d4ed8] hover:underline">
        Full disclaimers
      </Link>
    </p>
  );
}

/** Site-wide footer block. */
export function SiteDisclaimerFooter() {
  return (
    <footer className="no-print mt-auto border-t border-line bg-cream/80 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-2">
        <p className="display text-[10px] tracking-[0.2em] text-taupe">DISCLAIMERS</p>
        <DisclaimerNote />
        <p className="text-[11px] text-[#6b7280]">
          Licensed solicitation by Sam Kasimalla, FL Real Estate Agent, LPT Realty LLC · Equal Housing
          Opportunity ·{" "}
          <Link href={DISCLAIMER_PATH} className="font-semibold text-[#1d4ed8] hover:underline">
            Read full disclaimers
          </Link>
        </p>
      </div>
    </footer>
  );
}
