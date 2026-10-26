# VPSLedger
Finance-grade VPS cost tracker. Node 20, no deps.
- `npm run build` → dist/ (local SITE_URL http://localhost:4173) · `npm run build:prod` (SITE_URL, default https://vpsledger.pages.dev — placeholder, not registered)
- `npm run preview` serves on :4173 · `npm run visuals` OG/icons · `npm run check` weekly diff of source pages → reports/
- Data: data/providers.json (fees), data/plans.json (rows with source, checked, status), data/changes.json
- Go-live constants (all '#pending'): FORM_ACTION, CHECKOUT_PRO_MONTHLY/ANNUAL, CHECKOUT_SPONSOR, CONTACT, AFFILIATES, in scripts/build.mjs
