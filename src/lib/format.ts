export function usd(n: number, digits = 0) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function usdK(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return usd(n);
}

export function pct(n: number, digits = 1) {
  return `${n.toFixed(digits)}%`;
}

export function monthly(n: number) {
  return `${usd(n)}/mo`;
}

export function listingHeadline(p: { beds: number; baths: number; city: string }) {
  const bath = Number.isInteger(p.baths) ? String(p.baths) : String(p.baths);
  return `${p.beds} bed / ${bath} bath · ${p.city}`;
}

export function hashId(prefix: string, seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return `${prefix}-${Math.abs(h).toString(36)}`;
}

export function titleCaseAddress(s: string) {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\bFl\b/, "FL");
}
