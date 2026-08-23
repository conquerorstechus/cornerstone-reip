"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AssetType } from "../lib/types";

const TYPES: { id: AssetType; label: string; hint: string; disabled?: boolean }[] = [
  { id: "property", label: "Home", hint: "House or townhome" },
  { id: "area", label: "Area", hint: "City or zip code" },
  { id: "land", label: "Land", hint: "Coming soon", disabled: true },
  { id: "multifamily", label: "Apartments", hint: "Coming soon", disabled: true },
];

export function AnalyzeForm({
  defaultType = "property",
  defaultQuery = "",
}: {
  defaultType?: AssetType;
  defaultQuery?: string;
}) {
  const router = useRouter();
  const [type, setType] = useState<AssetType>(
    defaultType === "land" || defaultType === "multifamily" ? "property" : defaultType,
  );
  const [query, setQuery] = useState(defaultQuery);
  const [ask, setAsk] = useState("");
  const [beds, setBeds] = useState("3");
  const [baths, setBaths] = useState("2.5");
  const [sqft, setSqft] = useState("");
  const [units, setUnits] = useState("12");
  const [acres, setAcres] = useState("1.2");
  const [rent, setRent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          query,
          ask: ask ? Number(ask) : undefined,
          beds: beds ? Number(beds) : undefined,
          baths: baths ? Number(baths) : undefined,
          sqft: sqft ? Number(sqft) : undefined,
          units: units ? Number(units) : undefined,
          acres: acres ? Number(acres) : undefined,
          rent: rent ? Number(rent) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Analysis failed");
      router.push(`/reports/${json.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-cream ring-1 ring-line">
      <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        {TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={t.disabled}
            onClick={() => {
              if (!t.disabled) setType(t.id);
            }}
            className={`min-h-14 px-3 py-3 text-left sm:px-4 ${
              t.disabled
                ? "cursor-not-allowed bg-cream text-taupe/40"
                : type === t.id
                  ? "bg-navy text-cream"
                  : "bg-cream"
            }`}
          >
            <p className="display text-sm tracking-wide">{t.label}</p>
            <p className={`mt-0.5 text-[11px] ${type === t.id && !t.disabled ? "text-taupe-2" : "text-taupe"}`}>
              {t.hint}
            </p>
          </button>
        ))}
      </div>
      <div className="space-y-4 p-4 sm:p-6">
        <label className="block">
          <span className="display text-[10px] tracking-[0.2em] text-taupe">
            {type === "area" ? "MARKET / ZIP / CITY" : "ADDRESS OR NAME"}
          </span>
          <input
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              type === "area"
                ? "Wesley Chapel, FL 33543"
                : type === "land"
                  ? "US-301 & Chancey Rd, Zephyrhills"
                  : type === "multifamily"
                    ? "Meadow Glen Apartments, Wesley Chapel"
                    : "403 Thicket Crest Road, Seffner, FL 33584"
            }
            className="mt-1 w-full border-0 border-b border-line bg-transparent py-2 outline-none focus:border-blue"
          />
        </label>
        {type === "property" ? (
          <div className="grid gap-4 sm:grid-cols-5">
            <Num label="Ask $" value={ask} onChange={setAsk} />
            <Num label="Rent $/mo" value={rent} onChange={setRent} />
            <Num label="Beds" value={beds} onChange={setBeds} />
            <Num label="Baths" value={baths} onChange={setBaths} />
            <Num label="Sqft" value={sqft} onChange={setSqft} />
          </div>
        ) : null}
        {type === "land" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Num label="Ask $" value={ask} onChange={setAsk} />
            <Num label="Acres" value={acres} onChange={setAcres} />
          </div>
        ) : null}
        {type === "multifamily" ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <Num label="Ask $" value={ask} onChange={setAsk} />
            <Num label="Units" value={units} onChange={setUnits} />
            <Num label="In-place rent $/door" value={rent} onChange={setRent} />
          </div>
        ) : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button
          disabled={busy}
          className="min-h-11 w-full bg-magenta px-5 py-2.5 text-sm font-semibold tracking-wide text-white hover:bg-magenta-dark disabled:opacity-60 sm:w-auto"
        >
          {busy ? "Running…" : "Run analysis"}
        </button>
      </div>
    </form>
  );
}

function Num({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="display text-[10px] tracking-[0.18em] text-taupe">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border-0 border-b border-line bg-transparent py-2 outline-none focus:border-blue"
      />
    </label>
  );
}
