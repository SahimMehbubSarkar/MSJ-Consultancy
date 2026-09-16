import { NextRequest, NextResponse } from "next/server";

/**
 * MSJ Admin Middleware (Edge Runtime Compatible)
 *
 * Lightweight security gate:
 * - Ensures presence of session cookie before accessing protected /admin/* routes
 * - Directs unauthenticated traffic to /admin/login
 * - Redirects legacy /admin paths to canonical locations
 * - Pure edge-compatible (no Node.js crypto/pg required, zero clock-skew failure)
 * - Deep validation (DB session verification, expiration, revocation) happens in Server Components (layout.tsx)
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("msj_admin_token")?.value;

  // --- 1. Allow login page freely ---
  if (pathname === "/admin/login") {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }

  // --- 2. Protect all other /admin routes ---
  if (pathname.startsWith("/admin")) {
    // If no session token cookie is found, immediately redirect to login
    if (!token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.delete("already_logged_in");
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return redirectResponse;
    }

    // Canonical redirect: /admin -> /admin/dashboard
    if (pathname === "/admin") {
      const dashUrl = request.nextUrl.clone();
      dashUrl.pathname = "/admin/dashboard";
      return NextResponse.redirect(dashUrl);
    }

    // Canonical redirect: /admin/dashboard/<subpage> -> /admin/<subpage>
    if (pathname.startsWith("/admin/dashboard/")) {
      const sub = pathname.slice("/admin/dashboard/".length);
      const cleanUrl = request.nextUrl.clone();
      cleanUrl.pathname = `/admin/${sub}`;
      return NextResponse.redirect(cleanUrl);
    }

    // Session cookie present: allow request to proceed to Server Component (layout.tsx)
    // where database-backed session validity, revocation, and sliding expiry are verified.
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
