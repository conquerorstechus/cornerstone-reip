import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pitch deck" };

export default function PitchPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="display text-[11px] tracking-[0.28em] text-magenta">CONFIDENTIAL</p>
          <h2 className="display mt-1 text-3xl font-semibold">Pitch deck</h2>
          <p className="mt-2 max-w-2xl text-sm text-taupe">
            12-slide seed deck for RIP — Cornerstone Digital Technologies. 16:9, branded to the
            logo. Download the PDF or flip through it here.
          </p>
        </div>
        <a
          href="/RIP-Pitch-Deck.pdf"
          download
          className="bg-magenta px-4 py-2 text-sm font-semibold text-white hover:bg-magenta-dark"
        >
          Download PDF
        </a>
      </div>
      <iframe
        title="RIP pitch deck"
        src="/RIP-Pitch-Deck.pdf"
        className="h-[calc(100vh-220px)] min-h-[480px] w-full bg-cream ring-1 ring-line"
      />
    </div>
  );
}
