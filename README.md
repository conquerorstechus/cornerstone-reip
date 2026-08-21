# RIP — Real Estate Intelligence Platform

Cornerstone Digital Technologies platform for investors: **areas, properties, land, and multifamily**, with reports in the same shape as *Sam's High ROI Picks*.

Underwriting assumptions (matching the digest):

- Cash flow (NOI) = rent − tax − HOA − insurance
- Mortgage shown separately at **7% fixed, 30-year, 50% down**
- Suggested offer ~1.8% under ask (deeper haircut on full rehabs)

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Pitch deck: [public/RIP-Pitch-Deck.pdf](public/RIP-Pitch-Deck.pdf) (also `/pitch` in the app).

## n8n

See [n8n/README.md](n8n/README.md). Without webhook URLs configured, **Analyze** still works via the local engine.

## Stack

Next.js 16 · React 19 · Tailwind 4 · file-backed analysis runs in `.data/runs.json`.
