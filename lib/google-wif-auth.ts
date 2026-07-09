/**
 * Google Workload Identity Federation auth helper for Vercel.
 *
 * Vercel's "Secure Backend Access with OIDC Federation" does NOT inject
 * VERCEL_OIDC_TOKEN as an env var. Instead we must fetch the token at
 * runtime from Vercel's internal token endpoint using the
 * VERCEL_OIDC_TOKEN_ENDPOINT env var (auto-set by Vercel on Pro).
 *
 * Flow:
 *  1. Fetch OIDC JWT from Vercel's internal endpoint
 *  2. Exchange it for a Google STS federated access token
 *  3. Impersonate the service account to get a scoped access token
 */

interface WIFConfig {
  audience: string;
  token_url: string;
  service_account_impersonation_url?: string;
}

async function fetchVercelOidcToken(audience: string): Promise<string> {
  // Vercel injects this endpoint URL automatically on Pro plans
  const endpoint = process.env.VERCEL_OIDC_TOKEN_ENDPOINT;
  if (!endpoint) {
    throw new Error(
      "VERCEL_OIDC_TOKEN_ENDPOINT not set. Make sure 'Secure Backend Access with OIDC Federation' is enabled in Vercel project Settings → General."
    );
  }

  const res = await fetch(`${endpoint}?audience=${encodeURIComponent(audience)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${process.env.VERCEL_AUTOMATION_BYPASS_SECRET ?? ""}` },
  });

  if (!res.ok) {
    // Try without auth header — some Vercel versions don't need it
    const res2 = await fetch(`${endpoint}?audience=${encodeURIComponent(audience)}`);
    if (!res2.ok) {
      const err = await res2.text();
      throw new Error(`Failed to fetch Vercel OIDC token: ${err}`);
    }
    const { token } = await res2.json() as { token: string };
    return token;
  }

  const { token } = await res.json() as { token: string };
  return token;
}

export async function getGoogleAccessToken(scopes: string): Promise<string> {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON env var not set.");

  let config: WIFConfig;
  try {
    const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf-8");
    config = JSON.parse(json);
  } catch {
    throw new Error("Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON.");
  }

  // Step 1: Get Vercel OIDC JWT
  const oidcToken = await fetchVercelOidcToken(config.audience);

  // Step 2: Exchange for Google STS federated token
  const stsBody = new URLSearchParams({
    grant_type:           "urn:ietf:params:oauth:grant-type:token-exchange",
    audience:             config.audience,
    scope:                "https://www.googleapis.com/auth/cloud-platform",
    requested_token_type: "urn:ietf:params:oauth:token-type:access_token",
    subject_token:        oidcToken,
    subject_token_type:   "urn:ietf:params:oauth:token-type:jwt",
  });

  const stsRes = await fetch(config.token_url, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    stsBody.toString(),
  });
  if (!stsRes.ok) {
    const err = await stsRes.text();
    throw new Error(`Google STS exchange failed: ${err}`);
  }
  const { access_token: federatedToken } = await stsRes.json() as { access_token: string };

  // Step 3: Impersonate service account → scoped access token
  if (!config.service_account_impersonation_url) return federatedToken;

  const impersonateRes = await fetch(config.service_account_impersonation_url, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${federatedToken}`,
    },
    body: JSON.stringify({ scope: scopes.split(" "), lifetime: "3600s" }),
  });
  if (!impersonateRes.ok) {
    const err = await impersonateRes.text();
    throw new Error(`Service account impersonation failed: ${err}`);
  }
  const { accessToken } = await impersonateRes.json() as { accessToken: string };
  return accessToken;
}
