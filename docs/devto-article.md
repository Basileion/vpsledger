---
title: "I priced 33 VPS plans the way finance would: the same 2 vCPU / 4 GB server costs $4.54 or $29 a month"
published: false
tags: devops, cloud, selfhosted, webdev
canonical_url: https://vpsledger.pages.dev/
---

**The short version:** I pulled 33 plans from 15 providers, and 26 of them have prices I verified on the provider's own page or API. For each one I added back what the sticker price leaves out: IPv4, backups and bandwidth overage. Here is what came out (as of 2026-10-26, at 2 TB of egress a month):

- **2 vCPU / 4 GB:** the cheapest verified plan is OVHcloud VPS-1 at **$4.54/mo**. The most expensive is Linode 4 GB at **$29/mo**. That is a **$24.46/mo gap, or $294 a year**, for the same headline specs.
- **4 vCPU / 8 GB:** the cheapest is OVHcloud VPS-2 at **$8.50/mo**. The most expensive is DreamHost Stack 16 at **$34.99/mo**. That gap is **$26.49/mo, or $318 a year**.
- **Renewal jumps:** DreamHost Stack 16 goes up $12/mo at renewal (+52%). DreamHost Stack 4 goes up $7/mo (+78%). Hostinger KVM 2 goes up $6.20/mo (+71%) and Hostinger KVM 1 goes up $5.50/mo (+85%).
- **Largest hidden fee:** Linode 4 GB has $5/mo in add-ons on top of its $24 list price.

You can run your own numbers in the calculator: **[https://vpsledger.pages.dev/calculator.html](https://vpsledger.pages.dev/calculator.html)**

## Why the list price is misleading

A VPS pricing page shows you one number. The bill you actually pay usually includes some of these:

1. **IPv4.** Some providers charge for the address separately.
2. **Backups.** Usually a percentage of the plan price. Hetzner and Vultr both show about 20%.
3. **Bandwidth overage.** Included transfer ranges from 0.5 TB to 20 TB. Past that, prices differ a lot. Hetzner charges €1 per extra TB (EU). Vultr charges $0.01/GB, which is $10 per TB.
4. **Promo pricing.** Intro prices renew higher. The four renewal jumps listed above range from +52% to +85%.

Here is an example of how much transfer matters. Vultr's vc2-1c-0.5gb lists at $3.50. In the ledger its true cost is $9.20/mo at 1 TB of egress and $49.20/mo at 5 TB.

## How I collected the data

- Prices come only from official pricing pages or public APIs. Every price links to its source and shows the date it was checked.
- Every plan is marked **verified** or **unverified**. A plan is unverified if I couldn't read its price or a fee on the check date, and it says why. Unverified plans are never ranked. That's why there are 26 verified plans out of 33.
- EUR prices are converted at a dated rate (1.1188 USD/EUR on 2026-10-26).
- The full method is here: [https://vpsledger.pages.dev/methodology.html](https://vpsledger.pages.dev/methodology.html)

## Rankings by spec (2 TB egress, backups on)

**2 vCPU / 4 GB (10 verified plans):**

| Rank | Plan | True $/mo |
|---|---|---|
| 1 | OVHcloud VPS-1 | $4.54 |
| 2 | Hetzner CX23 | $6.70 |
| 5 | Hostinger KVM 2 | $14.99 |
| 6 | DreamHost Stack 4 | $15.99 |
| 7 | Vultr vc2-2c-4gb | $20.00 |
| 8 | Lightsail Linux 4 GB | $24.00 |
| 9 | DigitalOcean Basic 4 GB | $28.80 |
| 10 | Linode 4 GB | $29.00 |

**4 vCPU / 8 GB (4 verified plans):** OVHcloud VPS-2 is #1 at $8.50. Hetzner CX33 is #2 at $10.06. DreamHost Stack 16 is #4 at $34.99.

Every provider has its own page with the fee breakdown, such as [Hetzner](https://vpsledger.pages.dev/providers/hetzner.html) and [Linode](https://vpsledger.pages.dev/providers/linode.html). There are also head-to-head pages, such as [DigitalOcean vs Hetzner](https://vpsledger.pages.dev/compare/digitalocean-vs-hetzner.html).

## The calculator in practice

Open the [calculator](https://vpsledger.pages.dev/calculator.html), set 2 vCPU, 4 GB and 2 TB of egress, and turn backups on. You get the ranked list above, with each fee shown as a separate line and a source link for every number. Change the egress to 5 TB and the order changes, because providers with small transfer allowances start paying overage.

## The data is open

The whole ledger is available as JSON under CC BY 4.0:

- [https://vpsledger.pages.dev/api/plans.json](https://vpsledger.pages.dev/api/plans.json)
- [https://vpsledger.pages.dev/api/stats.json](https://vpsledger.pages.dev/api/stats.json)
- [https://vpsledger.pages.dev/api/changes.json](https://vpsledger.pages.dev/api/changes.json), the log of price changes (also available [as RSS](https://vpsledger.pages.dev/rss.xml))

## Free vs Pro

Everything above is free. **[VPSLedger Pro](https://vpsledger.pages.dev/pro.html)** costs $9/mo. It adds price-drop and renewal alerts and CSV export. It's built for people who don't want to find out about a promo renewal from their invoice.

*Disclosure: some outbound links on the site are affiliate links. They never affect the rankings. I'm not affiliated with any provider.*

If there's a provider you want me to add, or you spot a price I got wrong, tell me in the comments and I'll recheck it against the source.
