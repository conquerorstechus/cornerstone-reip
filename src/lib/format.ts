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

/** Strip street addresses and trailing location crumbs from listing copy. */
export function sanitizeDescription(
  text: string,
  opts: { address?: string; city?: string; state?: string; zip?: string } = {},
): string {
  let s = text.replace(/\r\n/g, "\n").trim();
  if (!s) return "";

  // Drop pipe-appended underwriting summary from some exports.
  s = s.replace(/\s*\|\s*Offer:\s*\$[\d,]+.*$/i, "");

  const needles: string[] = [];
  if (opts.address) {
    needles.push(opts.address);
    needles.push(opts.address.replace(/,/g, ""));
  }
  if (opts.address && opts.city) {
    needles.push(`${opts.address}, ${opts.city}`);
  }
  if (opts.city && opts.state && opts.zip) {
    needles.push(`${opts.city}, ${opts.state} ${opts.zip}`);
    needles.push(`${opts.city}, ${opts.state}, ${opts.zip}`);
  }
  for (const n of needles) {
    if (!n.trim()) continue;
    const esc = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    s = s.replace(new RegExp(esc, "gi"), " ");
  }

  // Leading "123 Main St, City, ST ZIP" style openers.
  s = s.replace(
    /^\s*\d{1,6}[A-Za-z]?\s+[A-Za-z0-9.'\-]+(?:\s+[A-Za-z0-9.'\-]+){0,6}\s*,?\s*[A-Za-z .'-]+,?\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?\s*[|·•\-]?\s*/i,
    "",
  );

  // Bare street patterns remaining in the body.
  s = s.replace(
    /\b\d{1,6}[A-Za-z]?\s+(?:[NSEW]\.?\s+)?[A-Za-z0-9.'\-]+(?:\s+[A-Za-z0-9.'\-]+){0,4}\s+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Blvd|Boulevard|Ln|Lane|Ct|Court|Cir|Circle|Way|Pl|Place|Trl|Trail|Pkwy|Parkway|Ter|Terrace|Hwy|Highway|Point)\b\.?/gi,
    " ",
  );

  // "Life at 123 …" / "features 123 …" leftovers.
  s = s.replace(/\b(?:at|on|of)\s+\d{1,6}[A-Za-z]?\b/gi, " ");

  // Trailing "· FL, 34667" crumbs from the digest template.
  s = s.replace(/\s*[·•]\s*[A-Z]{2},?\s*\d{5}(?:-\d{4})?\s*$/g, "");
  s = s.replace(/\s*[·•]\s*FL,?\s*\d{5}(?:-\d{4})?\s*/gi, " ");

  s = s
    .replace(/\s*[|·•]\s*[|·•]/g, " · ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s|,.\-–—:]+/, "")
    .replace(/[\s|,.\-–—]+$/, "")
    .trim();

  return s;
}

export function truncateCopy(s: string, max = 220) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return `${(at > 140 ? cut.slice(0, at) : cut).trim()}…`;
}
