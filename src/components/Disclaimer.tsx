import Link from "next/link";
import { DISCLAIMER_PATH, DISCLAIMER_SHORT } from "../lib/disclaimers";
import { RefreshListingsButton } from "./RefreshListingsButton";
import { SubscribeBanner } from "./SubscribeForm";

/** Compact disclaimer with link to the full legal page. */
export function DisclaimerNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-taupe ${className}`}>
      {DISCLAIMER_SHORT}{" "}
      <Link href={DISCLAIMER_PATH} className="font-semibold text-blue hover:underline">
        Full disclaimers
      </Link>
    </p>
  );
}

/** Site-wide footer block. */
export function SiteDisclaimerFooter() {
  return (
    <footer className="no-print mt-auto border-t border-line bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <SubscribeBanner page="footer" />
        <div className="space-y-2">
          <DisclaimerNote />
          <p className="text-xs text-taupe">
            Sam Kasimalla, FL Real Estate Agent, LPT Realty LLC · Equal Housing Opportunity
            <RefreshListingsButton /> ·{" "}
            <Link href="/privacy" className="font-semibold text-blue hover:underline">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
