import { Suspense } from "react";
import { MortgageCalculator } from "../../components/MortgageCalculator";

export const metadata = {
  title: "Mortgage & Closing Cost Calculator",
  description:
    "Full amortization schedule, Florida-typical closing costs (title, deed stamps, survey, escrow), taxes, insurance, and HOA. Connect with Arki Koul at Shopwise Mortgage.",
};

export default function MortgagePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl py-12 text-center text-sm text-[#6b7280]">
          Loading calculator…
        </div>
      }
    >
      <MortgageCalculator />
    </Suspense>
  );
}
