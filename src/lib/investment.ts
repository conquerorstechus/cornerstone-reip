import { mortgagePayment, ASSUMPTIONS } from "./analysis";
import {
  annualRateForScenario,
  projectValue,
  remainingLoanBalance,
  type AppreciationProfile,
  type AppreciationScenario,
} from "./appreciation";

export type DealFinancials = {
  purchasePrice: number;
  /** Monthly rent; 0 for land / no rent. */
  rentMonthly: number;
  taxMonthly: number;
  hoaMonthly: number;
  insuranceMonthly: number;
  rate?: number;
  termYears?: number;
};

export type CashOnCashResult = {
  downPct: number;
  downPayment: number;
  loanAmount: number;
  mortgageMonthly: number;
  noiMonthly: number;
  cashFlowMonthly: number;
  cashFlowAnnual: number;
  cashOnCash: number;
  /** True when purchase is all-cash (100% down). */
  allCash: boolean;
};

export type AppreciationYearRow = {
  year: number;
  propertyValue: number;
  loanBalance: number;
  equity: number;
  cumulativeCashFlow: number;
  totalProfit: number;
  equityMultiple: number;
  annualizedReturn: number;
};

export function operatingIncomeMonthly(f: DealFinancials): number {
  return f.rentMonthly - f.taxMonthly - f.hoaMonthly - f.insuranceMonthly;
}

/** Cash-on-cash at a given down-payment percent (1–100). */
export function cashOnCashAtDown(
  f: DealFinancials,
  downPctPercent: number,
): CashOnCashResult {
  const downPct = Math.min(1, Math.max(0.01, downPctPercent / 100));
  const price = f.purchasePrice;
  const downPayment = price * downPct;
  const loanAmount = price - downPayment;
  const rate = f.rate ?? ASSUMPTIONS.rate;
  const termYears = f.termYears ?? ASSUMPTIONS.termYears;
  const allCash = downPct >= 0.999;
  const mortgageMonthly = allCash ? 0 : mortgagePayment(price, downPct, rate, termYears);
  const noiMonthly = operatingIncomeMonthly(f);
  const cashFlowMonthly = noiMonthly - mortgageMonthly;
  const cashFlowAnnual = cashFlowMonthly * 12;
  const cashOnCash = downPayment > 0 ? cashFlowAnnual / downPayment : 0;

  return {
    downPct,
    downPayment,
    loanAmount,
    mortgageMonthly,
    noiMonthly,
    cashFlowMonthly,
    cashFlowAnnual,
    cashOnCash,
    allCash,
  };
}

export function appreciationSchedule(
  f: DealFinancials,
  profile: AppreciationProfile,
  scenario: AppreciationScenario,
  downPctPercent: number,
  horizonYears: number,
): AppreciationYearRow[] {
  const coc = cashOnCashAtDown(f, downPctPercent);
  const annualRate = annualRateForScenario(profile, scenario);
  const rate = f.rate ?? ASSUMPTIONS.rate;
  const termYears = f.termYears ?? ASSUMPTIONS.termYears;
  const rows: AppreciationYearRow[] = [];

  for (let year = 1; year <= horizonYears; year++) {
    const propertyValue = projectValue(f.purchasePrice, annualRate, year);
    const loanBalance = coc.allCash
      ? 0
      : remainingLoanBalance(coc.loanAmount, rate, termYears, year);
    const equity = propertyValue - loanBalance;
    const cumulativeCashFlow = coc.cashFlowAnnual * year;
    const totalProfit = equity - coc.downPayment + cumulativeCashFlow;
    const equityMultiple = coc.downPayment > 0 ? (equity + cumulativeCashFlow) / coc.downPayment : 0;
    const annualizedReturn =
      coc.downPayment > 0 && year > 0
        ? Math.pow((equity + cumulativeCashFlow) / coc.downPayment, 1 / year) - 1
        : 0;

    rows.push({
      year,
      propertyValue,
      loanBalance,
      equity,
      cumulativeCashFlow,
      totalProfit,
      equityMultiple,
      annualizedReturn,
    });
  }

  return rows;
}
