# Lead spam protection

Every website lead is submitted through `submitLead()` and validated again by
`POST /api/lead`. This covers the contact and recruiting forms, calculators,
company funnels, loan-officer funnels, co-branded funnels, and future generated
funnels that use the shared helper.

## Active controls

- Same-origin enforcement in production
- Required empty honeypot and a 2.5-second minimum completion time
- Strict names, US phone numbers, email, source, consent, state, and field limits
- Durable Supabase-backed limits: three submissions per IP per ten minutes and
  two submissions per email per day
- Silent duplicate suppression for matching email and phone within 24 hours
- Session ID, entry page, referrer, and device attribution on every submission
- Cloudflare Turnstile verification when its keys are configured

## Turnstile setup

Create an **Invisible** Turnstile widget in Cloudflare for every production
hostname. Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` to the
deployment environment, then redeploy. Never expose the secret key in a
`NEXT_PUBLIC_` variable.

The API deliberately enables Turnstile only when the secret is present, so local
development works without Cloudflare credentials. Production should always have
both keys configured.
