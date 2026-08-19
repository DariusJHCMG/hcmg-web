import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a mutable response so Supabase can set cookies
  let response = NextResponse.next({ request });

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

  const isAdminRoute      = pathname.startsWith("/admin");
  const isPortalRoute     = pathname.startsWith("/portal");
  // /liftoff routes but NOT /liftoff-login itself
  const isLiftOffRoute    = pathname.startsWith("/liftoff") && !pathname.startsWith("/liftoff-login");
  // Only the actual /goal-engine/* pages — NOT /goal-engine-login
  const isGoalEngineRoute = pathname.startsWith("/goal-engine/");
  const isLoginRoute      = pathname === "/login";
  const isLiftOffLoginRoute = pathname === "/liftoff-login";

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

  // Already logged in + hitting liftoff-login → go to liftoff
  if (isLiftOffLoginRoute && user) {
    return NextResponse.redirect(new URL("/liftoff", request.url));
  }

  // Already logged in + hitting main login → redirect to admin dashboard
  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

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
