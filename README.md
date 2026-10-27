# VPSLedger
Finance-grade VPS cost tracker. Node 20, no deps.
- `npm run build` → dist/ (local SITE_URL http://localhost:4173) · `npm run build:prod` (SITE_URL, default https://vpsledger.pages.dev — placeholder, not registered)
- `npm run preview` serves on :4173 · `npm run visuals` OG/icons · `npm run check` weekly diff of source pages → reports/
- Data: data/providers.json (fees), data/plans.json (rows with source, checked, status), data/changes.json
- Go-live constants (all '#pending'): FORM_ACTION, CHECKOUT_PRO_MONTHLY/ANNUAL, CHECKOUT_SPONSOR, CONTACT, AFFILIATES, in scripts/build.mjs

## SEO
- `seo/head-extra.html`: paste the Bing (`msvalidate.01`) verification meta tag here; it is injected into every page's `<head>` on build. (Google's tag is hardcoded in `scripts/build.mjs`.)
- `indexnow.key`: IndexNow key; build hosts it at `/<key>.txt`. After a deploy, run `node scripts/indexnow.mjs` to submit every sitemap URL to Bing/IndexNow.
- `dist/` is committed; run `npm run build:prod` before pushing.
