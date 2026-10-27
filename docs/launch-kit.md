# VPSLedger launch kit (drafts only — nothing posted)

No HN or Reddit (accounts are new/blocked). Every item below needs Kurt's approval before it goes out.

## Positioning (one line)
VPSLedger shows what a VPS really costs per month — base price plus IPv4, backups and bandwidth overage — normalized to $/vCPU and $/GB RAM, with every price linked to the provider's own page and dated.

## SEO plan
- Money pages already built: `/calculator.html` ("vps cost calculator", "cheapest vps 4gb ram"), 45 `/compare/a-vs-b.html` pages ("hetzner vs digitalocean", "vultr vs linode"…), 15 `/providers/*.html` ("hostinger vps renewal price", "lightsail bandwidth overage").
- Next content: "VPS renewal prices vs promo prices (2026)", "Bandwidth overage per TB, every provider", "Cheapest VPS with 8 GB RAM". Each must cite rows from the ledger.
- After deploy: submit sitemap in Google Search Console and Bing Webmaster Tools; add IndexNow key.
- Monthly: re-run `npm run check`, log changes, refresh `lastmod`.

## Directories (submit after deploy)
AlternativeTo (as alternative to VPSBenchmarks / Server Hunter), SaaSHub, Uneed, Fazier, Microlaunch, BetaList, DevHunt, Toolify-style dev-tool lists, awesome-selfhosted-adjacent "awesome" lists (PR only if a list accepts tools), LowEndTalk "offers/tools" only if rules allow.

## Product Hunt
- Name: VPSLedger
- Tagline (≤60): "The true monthly cost of a VPS, sourced and dated"
- Description: "Sticker prices skip the IPv4, the backups and the bandwidth bill. VPSLedger adds them back for 33 plans across 15 providers, ranks plans for your specs, and logs every price change with a source link. Free; Pro ($9/mo) adds price-drop alerts and CSV export."
- First comment: why I built it (renewal shock on a promo VPS), how verification works, what's unverified and why, ask for providers to add.
- Gallery: assets/og/home.png, calculator.png, compare.png, pro.png + screenshots/.

## dev.to article draft
Title: "I priced 33 VPS plans the way finance would: here's the true monthly cost"
Outline: 1) Why list price lies (IPv4, backups 20%, overage $0.01–$0.09/GB, promos renewing 1.7–1.9×). 2) Method: official pages/APIs only, verified vs unverified. 3) Findings table (link to ledger). 4) Calculator walkthrough at 2 vCPU/4 GB/2 TB egress. 5) Data is JSON, CC BY. Tags: #devops #cloud #selfhosted #webdev.

## Sponsor outreach (email draft)
Subject: Founding sponsor slot on VPSLedger — VPS buyers at decision time
Body: Hi {name}, I run VPSLedger, a sourced cost-of-ownership ledger for VPS plans (calculator + head-to-head pages). Readers arrive while choosing a server. I'm offering a founding sponsor slot: one clearly labeled placement in the weekly newsletter for $49 (https://o11y-watch.kit.com/products/vps-ledger-sponsor-slot-founding). Sponsors never affect rankings. We're new — no inflated numbers; I'll share real traffic monthly. Interested? — Kurt
Targets: control panels (RunCloud, Ploi, Coolify Cloud, CloudPanel), backup/monitoring (BetterStack, Healthchecks.io, SnapShooter), managed-DB and CDN vendors.
