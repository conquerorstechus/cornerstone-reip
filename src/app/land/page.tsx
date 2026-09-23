import { LandCard } from "../../components/LandCard";
import { DisclaimerNote } from "../../components/Disclaimer";
import { getLand } from "../../lib/data";

export const metadata = { title: "Land for Sale" };

export default async function LandPage() {
  const land = await getLand();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <div className="mb-3 flex overflow-hidden rounded-lg bg-[#f0fdfa]">
          <div className="w-1.5 shrink-0 bg-[#0d9488]" />
          <h2 className="px-4 py-3 text-xl font-extrabold tracking-tight text-[#0d9488] sm:text-2xl">
            Land for Sale
          </h2>
        </div>
        <p className="text-[13px] text-[#6b7280]">
          {land.length} lots · Address sent when you leave email and phone
        </p>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#374151]">
          Lots and acreage from Sam&apos;s High ROI land screen. Tap{" "}
          <strong>Send me the address</strong> and we deliver it right away.
        </p>
      </div>

      <div className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3.5 text-[13px] leading-relaxed text-[#1e3a5f]">
        Call/text <strong>908-922-1063</strong> if you want to talk through a lot before requesting
        the address.
      </div>

      <div className="space-y-5">
        {land.map((l) => (
          <LandCard key={l.id} parcel={l} />
        ))}
      </div>

      <DisclaimerNote />
    </div>
  );
}
