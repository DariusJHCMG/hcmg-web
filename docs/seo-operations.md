# SEO operations checklist

Last reviewed: July 20, 2026

## Immediately after deployment

1. In Google Search Console, submit `https://hcmgloans.com/sitemap.xml`.
2. Inspect a representative product URL, state hub, the Savannah guide, and the Las Vegas ARM URL. Request indexing only after the live canonical and rendered content are correct.
3. Use URL Inspection on each legacy WordPress URL and confirm it returns one permanent redirect to the intended non-`www` canonical URL.
4. Review **Page indexing** by reason: Crawled—not indexed, Discovered—not indexed, Duplicate without user-selected canonical, and Soft 404. Export affected URLs before validating fixes.
5. Do not request indexing for `/admin`, `/portal`, `/login`, `/reset-password`, API routes, or generated SEO pages carrying `noindex`.

## GA4 conversions

The site emits `funnel_start`, `funnel_complete`, `phone_click`, `email_click`, and `officer_profile_click`. In GA4 Admin > Events, mark the events that represent business outcomes as key events. Keep `funnel_start` as a diagnostic event; use `funnel_complete`, phone/email clicks, and qualified-lead outcomes for conversion reporting.

## Internal traffic filter

This requires the company’s public office/VPN IP ranges and GA4 property access, so it cannot be safely hard-coded in the website.

1. GA4 Admin > Data streams > Web stream > Configure tag settings > Show all > Define internal traffic.
2. Add office and VPN public IP addresses using `traffic_type=internal`.
3. GA4 Admin > Data settings > Data filters > Internal traffic.
4. Start the filter in **Testing**. Validate it with Realtime/DebugView before changing it to **Active**; active exclusion is permanent for incoming data.

Official instructions: https://support.google.com/analytics/answer/10104470

## Monthly quality review

- Compare indexed URLs to the sitemap; investigate unexpected index growth.
- Refresh product limits from HUD and FHFA official releases.
- Review queries with impressions and positions 8–20 before creating new pages.
- Merge or noindex pages that have no unique demand, links, engagement, or qualified leads.
- Segment leads by source and funnel, and report qualified versus rejected/spam submissions.
