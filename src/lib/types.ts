export type AssetType = "property" | "area" | "land" | "multifamily";

export type RunStatus = "complete" | "failed";

export type DealThesis =
  | "cashflow"
  | "value-add"
  | "full-rehab"
  | "turnkey"
  | "land-bank"
  | "development"
  | "multifamily";

export type HomeKind = "sfh" | "condo" | "townhouse";

export type Property = {
  id: string;
  rank?: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  zillowUrl?: string;
  mortgageUrl?: string;
  thesis: DealThesis;
  homeKind?: HomeKind;
  description: string;
  beds: number;
  baths: number;
  sqft: number;
  lotSqft?: number;
  yearBuilt: number;
  ask: number;
  offer: number;
  rent: number;
  taxMonthly: number;
  hoaMonthly: number;
  insuranceMonthly: number;
  mortgageMonthly: number;
  cashFlow: number;
  vacancyNote?: string;
  flags?: string[];
  tags: string[];
  areaSlug: string;
};

export type Area = {
  slug: string;
  name: string;
  county: string;
  zips: string[];
  lat: number;
  lng: number;
  investorScore: number;
  medianAsk: number;
  medianRent: number;
  medianCf: number;
  yoyPrice: number;
  yoyRent: number;
  vacancy: number;
  jobGrowth: number;
  population: number;
  medianHhIncome: number;
  floodRisk: "low" | "moderate" | "high";
  schoolScore: number;
  walkScore: number;
  commuteMin: number;
  thesis: string;
  risks: string[];
  catalysts: string[];
};

export type LandParcel = {
  id: string;
  rank?: number;
  address: string;
  city: string;
  zip: string;
  lat: number;
  lng: number;
  acres: number;
  lotSqft?: number;
  zoning: string;
  floodZone: string;
  utilities: string[];
  asking: number;
  offer?: number;
  pricePerAcre: number;
  buildableSf: number;
  maxUnits: number;
  investorScore: number;
  thesis: string;
  zillowUrl?: string;
  mortgageUrl?: string;
  taxMonthly?: number;
  hoaMonthly?: number;
  insuranceMonthly?: number;
  mortgageMonthly?: number;
  cashFlow?: number;
  flags?: string[];
  comps: { address: string; acres: number; price: number; closed: string }[];
  scenarios: {
    name: string;
    units: number;
    cost: number;
    exitValue: number;
    profit: number;
    roi: number;
  }[];
  areaSlug: string;
};

export type MultifamilyAsset = {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  lat: number;
  lng: number;
  yearBuilt: number;
  units: number;
  occupancy: number;
  asking: number;
  offer: number;
  gpr: number;
  egi: number;
  expenses: number;
  noi: number;
  capRate: number;
  grm: number;
  pricePerUnit: number;
  debtYield: number;
  unitMix: { type: string; count: number; rent: number }[];
  investorScore: number;
  thesis: string;
  risks: string[];
  areaSlug: string;
};

export type AnalysisRequest = {
  type: AssetType;
  query: string;
  ask?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  units?: number;
  acres?: number;
  yearBuilt?: number;
  rent?: number;
};

export type AnalysisRun = {
  id: string;
  type: AssetType;
  query: string;
  status: RunStatus;
  createdAt: string;
  completedAt?: string;
  error?: string;
  result?: AnalysisResult;
};

export type AnalysisResult = {
  title: string;
  subtitle: string;
  investorScore: number;
  recommendation: "pursue" | "watch" | "pass";
  summary: string;
  metrics: { label: string; value: string; hint?: string }[];
  cashFlow?: {
    rent: number;
    tax: number;
    hoa: number;
    insurance: number;
    mortgage: number;
    noi: number;
    afterDebt: number;
    ask: number;
    offer: number;
  };
  sections: { heading: string; body: string; bullets?: string[] }[];
  raw?: Record<string, unknown>;
};

export type DigestReport = {
  id: string;
  title: string;
  date: string;
  source: string;
  intro: string;
  deals: Property[];
};
