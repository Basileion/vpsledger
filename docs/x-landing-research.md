# X research: landing page, hero and checkout-funnel patterns

Collected 2026-10-26 via the X API (`search_posts_all`, relevancy sort, posts since 2025-01-01, 8 queries). Engagement = likes / reposts at fetch time. `min_faves:` returned only low-engagement recent posts, so ranking was done on returned `public_metrics`. Off-topic hits (generic AI-hustle posts) were excluded.

## Top posts

| # | Author | Post | Likes | Reposts | Gist |
|---|---|---|---|---|---|
| 1 | @cloudxdev | https://x.com/cloudxdev/status/2002526815022190985 | 1682 | 119 | Long design-director prompt for distinctive, non-generic landing pages |
| 2 | @marclou | https://x.com/marclou/status/1968657521578754370 | 471 | 14 | Conversion "almost doubled in 14 days": interactive demo in hero, new headline, "no card required" under every CTA, input-as-CTA instead of "signup" |
| 3 | @namyakhann | https://x.com/namyakhann/status/2024892454961582403 | 363 | 21 | 7-section SaaS landing formula (image) |
| 4 | @cloudxdev | https://x.com/cloudxdev/status/2003097964865102224 | 247 | 18 | Landing-page "skill" spec for single-file pages |
| 5 | @ConnorShowler | https://x.com/ConnorShowler/status/1971985311526781014 | 197 | 20 | 13-step landing page SEO/CRO formula |
| 6 | @adriankuleszo | https://x.com/adriankuleszo/status/1902510411167244435 | 153 | 5 | "Default to yearly pricing" on the pricing page |
| 7 | @maxwellcopy | https://x.com/maxwellcopy/status/2003905323896054140 | 68 | 4 | One goal (single CTA), above-the-fold focus, trust signals, frictionless action |
| 8 | @IAmAlenSultanic | https://x.com/IAmAlenSultanic/status/2011798506759934178 | 50 | 1 | Mini-guide to checkout-page conversion |
| 9 | @heyblake | https://x.com/heyblake/status/1892223875360178646 | 29 | 2 | 50 SaaS pages converting >15%: don't put everything on the hero |
| 10 | @heyblake | https://x.com/heyblake/status/1951195197645398244 | 16 | 1 | Clear promise, frictionless CTA, social proof above the fold, one path |
| 11 | @indiewhacker | https://x.com/indiewhacker/status/2086080771245142287 | 14 | 0 | Checkout conversion is decided by what happens before checkout |
| 12 | @heyblake | https://x.com/heyblake/status/2086846790372839550 | 13 | 0 | Pricing page: outcomes not features; tiers a buyer can choose without emailing |
| — | @alexii_9 | https://x.com/alexii_9/status/2090468903403077693 | 7 | 0 | Poll: annual discount toggle ("2 months free") vs monthly-only |
| — | @tweetsbycolin | https://x.com/tweetsbycolin/status/1919114511316820029 | 9 | 0 | Asks for the best annual/monthly toggle |

## Recurring patterns
1. **Product-as-demo in the hero** (#2): let the visitor use the product above the fold; input replaces a "Sign up" button.
2. **Frictionless CTA microcopy** (#2, #7, #10): one primary action, a reassurance line under it ("no card required").
3. **One path** (#7, #10): single primary + one secondary CTA, few distractions.
4. **Proof above the fold** (#7, #10): usually logos/testimonials — we substitute verifiable proof (verified plans, sources, logged changes).
5. **Annual-first pricing toggle** (#6, poll): default to yearly, show the saving.
6. **Outcome-led pricing + clear tiers** (#12): features phrased as outcomes; obvious recommended plan; objection FAQ beside pricing.
7. **Pre-checkout work matters** (#8, #11): summarize what you get, price, and terms before handing off to the processor.

## Applied on VPSLedger (ui-refresh)
Hero overpay check as the demo (1, 2); "Free · no signup · no card" microcopy (2); single primary/secondary CTA + sticky mobile CTA (3); real-proof strip with data-driven counts (4); annual-default toggle with computed saving and highlighted plan (5); outcome-led feature grid + objection FAQ next to pricing (6); /checkout.html summary page before Kit (7); progressive funnel check → email → Pro.
Not used: testimonials, user counts, logos, countdowns, scarcity — we have none that are real.
