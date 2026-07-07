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

  // Refresh session (required by @supabase/ssr)
  const { data: { user } } = await supabase.auth.getUser();

  const isAdminRoute  = pathname.startsWith("/admin");
  const isPortalRoute = pathname.startsWith("/portal");
  const isLoginRoute  = pathname === "/login";

  // Not logged in → redirect to login
  if ((isAdminRoute || isPortalRoute) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Logged in + trying to access login → redirect to their dashboard
  if (isLoginRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const dest = profile?.role === "loan_officer" ? "/portal" : "/admin";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Loan officer trying to access admin → redirect to portal
  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role === "loan_officer") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/login"],
};
