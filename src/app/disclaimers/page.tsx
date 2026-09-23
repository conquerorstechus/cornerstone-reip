import type { Metadata } from "next";
import Link from "next/link";
import { DISCLAIMER_FULL } from "../../lib/disclaimers";

export const metadata: Metadata = {
  title: "Disclaimers",
};

export default function DisclaimersPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="display text-[11px] tracking-[0.28em] text-magenta">LEGAL</p>
        <h1 className="display mt-1 text-2xl font-semibold sm:text-3xl">Disclaimers</h1>
        <p className="mt-2 text-sm text-taupe">
          Important notices for Sam&apos;s High ROI Picks and the REIP portal.
        </p>
      </div>

      <div className="rounded-lg border border-[#e5e7eb] bg-white px-5 py-5 text-[14px] leading-relaxed text-[#374151] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <p>{DISCLAIMER_FULL}</p>
      </div>

      <div className="space-y-3 text-[13px] leading-relaxed text-[#4b5563]">
        <h2 className="text-base font-semibold text-[#1e3a5f]">What this means in plain terms</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Numbers you see (rent, taxes, HOA, insurance, cash flow, offers, mortgages, appreciation,
            and total returns) are <strong>estimates</strong>, not promises.
          </li>
          <li>
            Models on deal pages are educational tools. Markets change. Past growth does not guarantee
            future results.
          </li>
          <li>
            This is licensed real estate solicitation in Florida. It is not tax, legal, or investment
            advice.
          </li>
          <li>Fair housing laws apply. We do not discriminate.</li>
          <li>
            To stop marketing messages, reply <strong>UNSUBSCRIBE</strong>.
          </li>
        </ul>
      </div>

      <p className="text-[12px] text-[#6b7280]">
        Mailing address: 19046 Bruce B Downs Blvd, #1376, Tampa, FL 33647.
      </p>

      <Link href="/picks/condos" className="inline-flex text-[13px] font-semibold text-[#1d4ed8] hover:underline">
        ← Back to deals
      </Link>
    </div>
  );
}
