export const MARKETS = [{ id: "greater-tampa", name: "Greater Tampa" }] as const;

export type MarketId = (typeof MARKETS)[number]["id"];

export const DEFAULT_MARKET_ID: MarketId = "greater-tampa";
