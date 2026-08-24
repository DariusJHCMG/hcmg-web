import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ── CSP builder ──────────────────────────────────────────────────────────────
function buildCsp(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://us.i.posthog.com https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://iryqfwktlwcqqlmvtngx.supabase.co https://us.i.posthog.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
    "font-src 'self' data:",
    "connect-src 'self' https://iryqfwktlwcqqlmvtngx.supabase.co wss://iryqfwktlwcqqlmvtngx.supabase.co https://us.i.posthog.com https://challenges.cloudflare.com",
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const csp = buildCsp();

  // Create a mutable response so Supabase can set cookies
  let response = NextResponse.next({ request });
  response.headers.set("content-security-policy", csp);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          response.headers.set("content-security-policy", csp);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — use getSession to avoid extra network round-trip
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const isAdminRoute        = pathname.startsWith("/admin");
  const isPortalRoute       = pathname.startsWith("/portal");
  // /liftoff routes but NOT /liftoff-login itself
  const isLiftOffRoute      = pathname.startsWith("/liftoff") && !pathname.startsWith("/liftoff-login");
  // Only the actual /goal-engine/* pages — NOT /goal-engine-login
  const isGoalEngineRoute   = pathname.startsWith("/goal-engine/");
  const isLoginRoute        = pathname === "/login";
  const isLiftOffLoginRoute = pathname === "/liftoff-login";
  const isGoalEngineLogin   = pathname === "/goal-engine-login";

  // ── MFA enforcement ──────────────────────────────────────────────────────
  // Protected routes require AAL2 (MFA verified). AAL1 means the user has a
  // valid password session but has NOT completed MFA — kick them to login.
  // This catches everyone already logged in without MFA, not just new logins.
  const isProtectedRoute = isAdminRoute || isPortalRoute || isLiftOffRoute || isGoalEngineRoute;

  if (isProtectedRoute && user) {
    // Use the official Supabase MFA API to read the current AAL from the JWT.
    // currentLevel = aal1 → password only (no MFA). aal2 → MFA verified.
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const currentLevel = aalData?.currentLevel ?? "aal1";

    if (currentLevel === "aal1") {
      // Valid password session but MFA not completed — clear cookies and
      // redirect to the appropriate login page so they go through MFA flow.
      const clearCookies = (res: NextResponse) => {
        request.cookies.getAll().forEach(({ name }) => {
          if (name.includes("supabase") || name.startsWith("sb-")) {
            res.cookies.set(name, "", { maxAge: 0, path: "/" });
          }
        });
        return res;
      };

      if (isLiftOffRoute) {
        return clearCookies(NextResponse.redirect(
          new URL(`/liftoff-login?next=${encodeURIComponent(pathname)}`, request.url)
        ));
      }
      if (isGoalEngineRoute) {
        return clearCookies(NextResponse.redirect(
          new URL(`/goal-engine-login?next=${encodeURIComponent(pathname)}`, request.url)
        ));
      }
      // admin / portal
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return clearCookies(NextResponse.redirect(url));
    }
  }
  // ── End MFA enforcement ──────────────────────────────────────────────────

  // Not logged in → redirect to dedicated Lift Off login
  if (isLiftOffRoute && !user) {
    return NextResponse.redirect(
      new URL(`/liftoff-login?next=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  // Not logged in → redirect to main login for admin/portal
  if ((isAdminRoute || isPortalRoute) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Goal Engine pages: not logged in → send to Goal Engine login
  if (isGoalEngineRoute && !user) {
    return NextResponse.redirect(new URL(`/goal-engine-login?next=${encodeURIComponent(pathname)}`, request.url));
  }

  // Already logged in + hitting a login page → skip login only if MFA is done
  if (isLiftOffLoginRoute && user) {
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalData?.currentLevel === "aal2") {
      return NextResponse.redirect(new URL("/liftoff", request.url));
    }
  }

  if (isLoginRoute && user) {
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalData?.currentLevel === "aal2") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  if (isGoalEngineLogin && user) {
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalData?.currentLevel === "aal2") {
      return NextResponse.redirect(new URL("/goal-engine/dashboard", request.url));
    }
  }

  // Ensure CSP is set on the final response (Supabase setAll may have rebuilt it)
  response.headers.set("content-security-policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/liftoff/:path*",
    "/liftoff",
    "/liftoff-login",
    "/login",
    "/goal-engine/:path*",
  ],
};
