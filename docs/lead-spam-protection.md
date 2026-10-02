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

The widget (`0x4AAAAAAFMLT04JwKFyOkJX`) is already created in Cloudflare Turnstile
as an Invisible widget for `hcmgloans.com`.

Three environment variables must be set in Vercel (Settings → Environment Variables):

| Variable | Where | Value |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Vercel + `.env.local` | `0x4AAAAAAFMLT04JwKFyOkJX` |
| `TURNSTILE_SECRET_KEY` | Vercel only (secret) | from Cloudflare dashboard |
| `TURNSTILE_HOSTNAMES` | Vercel + `.env.local` | `hcmgloans.com` (prod) / `localhost,127.0.0.1` (local) |

**Important:** The frontend key must be named `NEXT_PUBLIC_TURNSTILE_SITE_KEY` —
not `TURNSTILE_SITE_KEY`. The `NEXT_PUBLIC_` prefix is required for Next.js to
expose the variable to the browser bundle.

The API enables Turnstile only when `TURNSTILE_SECRET_KEY` is present, so local
development works without it. Production must have all three values set.

Every token is stamped with `action: "lead"` on the frontend and validated against
that same action on the backend. The backend also validates the token's `hostname`
against the `TURNSTILE_HOSTNAMES` allowlist when that list is non-empty.
