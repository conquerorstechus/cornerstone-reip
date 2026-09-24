/**
 * Typical Greater Tampa / Florida purchase closing-cost assumptions.
 * County practices vary (e.g. who pays deed stamps). Figures are educational defaults.
 */

export type ClosingCostLine = {
  id: string;
  category:
    | "lender"
    | "title"
    | "government"
    | "third_party"
    | "prepaids"
    | "escrow";
  label: string;
  amount: number;
  note?: string;
  /** Who typically pays in FL purchase deals */
  typicallyPaidBy?: "buyer" | "seller" | "split" | "negotiable";
};

export type ClosingCostInput = {
  price: number;
  loanAmount: number;
  annualRatePct: number;
  /** Days of prepaid interest at closing (typical 15–30). */
  prepaidInterestDays?: number;
  taxAnnual: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  /** Months of tax escrow collected at closing. */
  taxEscrowMonths?: number;
  /** Months of insurance escrow (often 2–14 including prepaid year). */
  insuranceEscrowMonths?: number;
};

export type ClosingCostSummary = {
  lines: ClosingCostLine[];
  byCategory: Record<ClosingCostLine["category"], number>;
  buyerClosingCosts: number;
  prepaidsAndEscrow: number;
  cashToCloseExDown: number;
  /** Approximate total buyer funds besides down payment. */
  totalBuyerFundsBesideDown: number;
};

const CAT_LABEL: Record<ClosingCostLine["category"], string> = {
  lender: "Lender fees",
  title: "Title & settlement",
  government: "Government / recording / taxes",
  third_party: "Inspections & third parties",
  prepaids: "Prepaids",
  escrow: "Escrow reserves",
};

export function categoryLabel(c: ClosingCostLine["category"]) {
  return CAT_LABEL[c];
}

/** Rough FL owner's title premium schedule (simplified graduated). */
function floridaOwnersTitle(price: number): number {
  if (price <= 0) return 0;
  // Simplified: ~$5.75/$1k first $100k, then declining — use blended ~$3.50/$1k with floor.
  const base = Math.max(575, price * 0.0035);
  return Math.round(base);
}

function floridaLendersTitle(loan: number): number {
  if (loan <= 0) return 0;
  // Lender's policy is simultaneous-issue discount vs owner's — ~$1.50–2.50/$1k typical.
  return Math.round(Math.max(350, loan * 0.00175));
}

/** FL documentary stamp on deed: $0.70 per $100 of consideration. Often seller-paid. */
export function floridaDeedDocStamps(price: number): number {
  if (price <= 0) return 0;
  return Math.ceil(price / 100) * 0.7;
}

/** FL documentary stamp on mortgage note: $0.35 per $100 of loan. Buyer. */
export function floridaMortgageDocStamps(loan: number): number {
  if (loan <= 0) return 0;
  return Math.ceil(loan / 100) * 0.35;
}

/** FL intangible tax on mortgage: $0.002 per $1 of loan. Buyer. */
export function floridaIntangibleTax(loan: number): number {
  if (loan <= 0) return 0;
  return Math.round(loan * 0.002 * 100) / 100;
}

export function buildClosingCosts(input: ClosingCostInput): ClosingCostSummary {
  const {
    price,
    loanAmount,
    annualRatePct,
    prepaidInterestDays = 15,
    taxAnnual,
    insuranceAnnual,
    hoaMonthly,
    taxEscrowMonths = 3,
    insuranceEscrowMonths = 2,
  } = input;

  const financed = loanAmount > 0;
  const dailyInterest = financed ? (loanAmount * (annualRatePct / 100)) / 365 : 0;
  const prepaidInterest = Math.round(dailyInterest * prepaidInterestDays);

  const lines: ClosingCostLine[] = [
    // Lender
    {
      id: "origination",
      category: "lender",
      label: "Loan origination (0.75% of loan)",
      amount: financed ? Math.round(loanAmount * 0.0075) : 0,
      note: "Typical 0.5–1%. Some lenders credit this back with a higher rate.",
      typicallyPaidBy: "buyer",
    },
    {
      id: "underwriting",
      category: "lender",
      label: "Underwriting / processing",
      amount: financed ? 995 : 0,
      note: "Typical $400–$1,200 flat.",
      typicallyPaidBy: "buyer",
    },
    {
      id: "credit-report",
      category: "lender",
      label: "Credit report",
      amount: financed ? 75 : 0,
      typicallyPaidBy: "buyer",
    },
    {
      id: "flood-cert",
      category: "lender",
      label: "Flood certification",
      amount: financed ? 20 : 0,
      typicallyPaidBy: "buyer",
    },
    {
      id: "tax-service",
      category: "lender",
      label: "Tax service fee",
      amount: financed ? 85 : 0,
      typicallyPaidBy: "buyer",
    },
    {
      id: "appraisal",
      category: "lender",
      label: "Appraisal",
      amount: financed ? 650 : 0,
      note: "Typical SFR $500–$750; condos / complex properties can run higher.",
      typicallyPaidBy: "buyer",
    },

    // Title
    {
      id: "owners-title",
      category: "title",
      label: "Owner’s title insurance (est.)",
      amount: floridaOwnersTitle(price),
      note: "Protects you; premium is regulated in FL. Often negotiated who pays.",
      typicallyPaidBy: "negotiable",
    },
    {
      id: "lenders-title",
      category: "title",
      label: "Lender’s title insurance (est.)",
      amount: financed ? floridaLendersTitle(loanAmount) : 0,
      note: "Required by the lender when you finance.",
      typicallyPaidBy: "buyer",
    },
    {
      id: "title-search",
      category: "title",
      label: "Title search / exam",
      amount: 275,
      typicallyPaidBy: "negotiable",
    },
    {
      id: "settlement",
      category: "title",
      label: "Settlement / closing fee",
      amount: 450,
      note: "Title company or attorney closing fee.",
      typicallyPaidBy: "split",
    },
    {
      id: "courier-wire",
      category: "title",
      label: "Courier / wire / overnight",
      amount: 75,
      typicallyPaidBy: "buyer",
    },

    // Government
    {
      id: "deed-stamps",
      category: "government",
      label: "Documentary stamps on deed (FL)",
      amount: floridaDeedDocStamps(price),
      note: "$0.70 per $100 of purchase price. Often seller-paid in many FL markets — still shown for full picture.",
      typicallyPaidBy: "seller",
    },
    {
      id: "mortgage-stamps",
      category: "government",
      label: "Documentary stamps on mortgage (FL)",
      amount: floridaMortgageDocStamps(loanAmount),
      note: "$0.35 per $100 of loan amount. Buyer.",
      typicallyPaidBy: "buyer",
    },
    {
      id: "intangible",
      category: "government",
      label: "Intangible tax on mortgage (FL)",
      amount: floridaIntangibleTax(loanAmount),
      note: "$2 per $1,000 of loan. Buyer.",
      typicallyPaidBy: "buyer",
    },
    {
      id: "recording-deed",
      category: "government",
      label: "Recording — deed",
      amount: 40,
      typicallyPaidBy: "negotiable",
    },
    {
      id: "recording-mortgage",
      category: "government",
      label: "Recording — mortgage / note",
      amount: financed ? 60 : 0,
      typicallyPaidBy: "buyer",
    },

    // Third party
    {
      id: "survey",
      category: "third_party",
      label: "Boundary survey",
      amount: 550,
      note: "Typical residential $400–$800. Lenders often require a recent survey or survey affidavit.",
      typicallyPaidBy: "buyer",
    },
    {
      id: "home-inspection",
      category: "third_party",
      label: "Home inspection",
      amount: 450,
      note: "Optional but strongly recommended. $350–$600 typical.",
      typicallyPaidBy: "buyer",
    },
    {
      id: "pest",
      category: "third_party",
      label: "Wood-destroying organism (WDO / pest) inspection",
      amount: 125,
      typicallyPaidBy: "buyer",
    },
    {
      id: "radon-mold",
      category: "third_party",
      label: "Radon / mold add-on (optional est.)",
      amount: 200,
      note: "Optional specialty inspections.",
      typicallyPaidBy: "buyer",
    },
    {
      id: "hoa-estoppel",
      category: "third_party",
      label: "HOA / condo estoppel & transfer",
      amount: hoaMonthly > 0 ? 350 : 0,
      note: "Charged when the community has an HOA or condo association.",
      typicallyPaidBy: "buyer",
    },
    {
      id: "attorney",
      category: "third_party",
      label: "Buyer attorney (optional in FL)",
      amount: 0,
      note: "FL is not an attorney-mandatory state for closings; set if you hire counsel (~$800–$1,500).",
      typicallyPaidBy: "buyer",
    },

    // Prepaids
    {
      id: "prepaid-interest",
      category: "prepaids",
      label: `Prepaid interest (~${prepaidInterestDays} days)`,
      amount: prepaidInterest,
      note: "Interest from funding date to month-end.",
      typicallyPaidBy: "buyer",
    },
    {
      id: "prepaid-insurance",
      category: "prepaids",
      label: "First year homeowners insurance",
      amount: Math.round(insuranceAnnual),
      note: "Usually paid at closing or proof of paid policy required.",
      typicallyPaidBy: "buyer",
    },
    {
      id: "prepaid-hoa",
      category: "prepaids",
      label: "HOA dues (proration / first month)",
      amount: hoaMonthly > 0 ? Math.round(hoaMonthly) : 0,
      typicallyPaidBy: "buyer",
    },

    // Escrow
    {
      id: "escrow-tax",
      category: "escrow",
      label: `Tax escrow reserve (${taxEscrowMonths} mo)`,
      amount: financed ? Math.round((taxAnnual / 12) * taxEscrowMonths) : 0,
      note: "Lender holds this to pay the tax bill when due.",
      typicallyPaidBy: "buyer",
    },
    {
      id: "escrow-ins",
      category: "escrow",
      label: `Insurance escrow reserve (${insuranceEscrowMonths} mo)`,
      amount: financed ? Math.round((insuranceAnnual / 12) * insuranceEscrowMonths) : 0,
      typicallyPaidBy: "buyer",
    },
  ];

  const active = lines.filter((l) => l.amount > 0 || l.id === "attorney");

  const byCategory: ClosingCostSummary["byCategory"] = {
    lender: 0,
    title: 0,
    government: 0,
    third_party: 0,
    prepaids: 0,
    escrow: 0,
  };
  for (const l of active) byCategory[l.category] += l.amount;

  // Buyer-facing cash (exclude items typically seller-paid like deed stamps for "buyer cash" total,
  // but still list them). For cash-to-close we include negotiable/buyer/split.
  const buyerLines = active.filter(
    (l) => l.typicallyPaidBy === "buyer" || l.typicallyPaidBy === "split" || l.typicallyPaidBy === "negotiable",
  );
  const buyerClosingCosts = buyerLines
    .filter((l) => l.category !== "prepaids" && l.category !== "escrow")
    .reduce((s, l) => s + l.amount, 0);
  const prepaidsAndEscrow = active
    .filter((l) => l.category === "prepaids" || l.category === "escrow")
    .reduce((s, l) => s + l.amount, 0);

  return {
    lines: active,
    byCategory,
    buyerClosingCosts,
    prepaidsAndEscrow,
    cashToCloseExDown: buyerClosingCosts + prepaidsAndEscrow,
    totalBuyerFundsBesideDown: buyerClosingCosts + prepaidsAndEscrow,
  };
}

export type AmortRow = {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
};

export function fullAmortizationSchedule(
  principal: number,
  annualRatePct: number,
  years: number,
): { rows: AmortRow[]; totalInterest: number; totalPaid: number; payment: number } {
  const n = years * 12;
  const r = annualRatePct / 100 / 12;
  let payment = 0;
  if (principal <= 0) {
    return { rows: [], totalInterest: 0, totalPaid: 0, payment: 0 };
  }
  if (r === 0) payment = principal / n;
  else payment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const rows: AmortRow[] = [];
  let bal = principal;
  let cumI = 0;
  let cumP = 0;

  for (let m = 1; m <= n && bal > 0.005; m++) {
    const interest = r === 0 ? 0 : bal * r;
    let principalPart = payment - interest;
    if (principalPart > bal) {
      principalPart = bal;
      payment = principalPart + interest;
    }
    bal = Math.max(0, bal - principalPart);
    cumI += interest;
    cumP += principalPart;
    rows.push({
      month: m,
      year: Math.ceil(m / 12),
      payment: principalPart + interest,
      principal: principalPart,
      interest,
      balance: bal,
      cumulativeInterest: cumI,
      cumulativePrincipal: cumP,
    });
  }

  const totalInterest = cumI;
  return {
    rows,
    totalInterest,
    totalPaid: principal + totalInterest,
    payment: rows[0]?.payment ?? payment,
  };
}

/** Yearly rollups from a full schedule. */
export function amortizationByYear(rows: AmortRow[]) {
  const map = new Map<
    number,
    { year: number; principal: number; interest: number; endingBalance: number; payments: number }
  >();
  for (const r of rows) {
    const cur = map.get(r.year) ?? {
      year: r.year,
      principal: 0,
      interest: 0,
      endingBalance: r.balance,
      payments: 0,
    };
    cur.principal += r.principal;
    cur.interest += r.interest;
    cur.endingBalance = r.balance;
    cur.payments += 1;
    map.set(r.year, cur);
  }
  return [...map.values()];
}
