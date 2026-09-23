# REIP — Real Estate Intelligence Platform

Cornerstone Digital Technologies portal for investors: **areas, homes, land, and apartments**, with reports in the same shape as *Sam's High ROI Picks*.

Cash flow = rent − tax − HOA − insurance. Mortgage is shown separately at 7% / 30-year / 50% down.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Live digest (Sam's list)

Homes and land on the portal load from Sam's High ROI JSON:

1. **Local (default):** place `sams-list-20260922.json` in the project root (already present).
2. **Remote API (recommended):** upload the same file to a free JSON host and set `SAM_LIST_URL`.

### Free host: [JSONBlob](https://jsonblob.com)

No account. Upload once, get a public GET URL, update later with `PUT`.

```bash
curl -i -X POST https://jsonblob.com/api/jsonBlob \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --data-binary @sams-list-20260922.json
```

Copy the `Location` header into `.env.local`:

```bash
SAM_LIST_URL=https://jsonblob.com/api/jsonBlob/YOUR_BLOB_ID
```

Refresh the hosted blob when the list changes:

```bash
curl -X PUT "$SAM_LIST_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --data-binary @sams-list-YYYYMMDD.json
```

The portal revalidates remote data about every 60 seconds. Inspect the mapped book at `/api/digest`.
