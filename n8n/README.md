# n8n workflows for RIP

Importable templates. RIP keeps underwriting math and storage; n8n scrapes, enriches, and emails.

## Import

1. n8n → **Workflows → Import from File** → pick a JSON in this folder.
2. Set n8n environment variables:
   - `APP_BASE_URL` — this Next app, e.g. `http://localhost:3000`
   - `N8N_SHARED_SECRET` — must match RIP's `N8N_SHARED_SECRET`
3. Activate the workflow. Copy the **production** webhook URL into RIP `.env.local`:

| Workflow | Webhook path | RIP env var |
|---|---|---|
| `rip-property-analysis.json` | `/webhook/rip-property-analysis` | `N8N_WEBHOOK_PROPERTY` |
| `rip-area-analysis.json` | `/webhook/rip-area-analysis` | `N8N_WEBHOOK_AREA` |
| `rip-land-analysis.json` | `/webhook/rip-land-analysis` | `N8N_WEBHOOK_LAND` |
| `rip-multifamily-analysis.json` | `/webhook/rip-multifamily-analysis` | `N8N_WEBHOOK_MULTIFAMILY` |
| `rip-high-roi-digest.json` | `/webhook/rip-high-roi-digest` | `N8N_WEBHOOK_DIGEST` |

## Handshake

RIP → n8n:

```
POST {webhook}
Header: x-webhook-secret
Body: { runId, callbackUrl, type, query, ask, beds, baths, sqft, units, acres, rent }
```

n8n → RIP:

```
POST {APP_BASE_URL}/api/webhooks/n8n
Header: x-webhook-secret
Body: { runId, result }   // result is the AnalysisResult shape RIP renders
```

If a webhook is missing or n8n is down, RIP runs the local engine (same High ROI Picks stack: 7% / 30-year / 50% down, cash flow = rent − tax − HOA − insurance).

## Digest

`rip-high-roi-digest.json` also has a Friday 8am schedule. It `GET`s `/api/digest` (same secret header) and formats the ranked list like Sam's High ROI Picks email. Add a Gmail / SMTP node after **Format email** to send it.

Swap the Code nodes for Apify / Zillow / RentCast / county GIS HTTP requests when you want live data — keep the callback payload shape.
