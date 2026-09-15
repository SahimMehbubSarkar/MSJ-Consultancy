import { NextRequest, NextResponse } from "next/server";
import { verifyToken, refreshToken, shouldRefresh } from "@/lib/jwt";

/**
 * MSJ Admin Middleware
 *
 * - Protects all /admin/* routes (redirect to login if no valid JWT)
 * - Blocks /admin/login when already authenticated (redirect to dashboard)
 * - Redirects legacy /admin/dashboard/<subpage> to clean /admin/<subpage>
 * - Redirects /admin to /admin/dashboard
 * - Auto-refreshes JWT if less than 1 day remains before expiry
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("msj_admin_token")?.value;

  // --- Block login page when already authenticated ---
  if (pathname === "/admin/login") {
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/admin/dashboard";
        loginUrl.searchParams.set("already_logged_in", "true");

        const response = NextResponse.redirect(loginUrl);
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

        // Refresh token if needed
        if (shouldRefresh(payload)) {
          const newToken = await refreshToken(payload);
          response.cookies.set("msj_admin_token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 3,
          });
        }

        return response;
      }
    }
    const loginPassResponse = NextResponse.next();
    loginPassResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return loginPassResponse;
  }

  // --- Protect all other /admin routes ---
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.delete("already_logged_in");
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return redirectResponse;
    }

    const payload = await verifyToken(token);

    if (!payload) {
      // Token invalid or expired
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("expired", "true");
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set("msj_admin_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return response;
    }

    // Redirect /admin to /admin/dashboard
    if (pathname === "/admin") {
      const dashUrl = request.nextUrl.clone();
      dashUrl.pathname = "/admin/dashboard";
      return NextResponse.redirect(dashUrl);
    }

    // Redirect legacy /admin/dashboard/<subpage> to clean /admin/<subpage>
    if (pathname.startsWith("/admin/dashboard/")) {
      const sub = pathname.slice("/admin/dashboard/".length);
      const cleanUrl = request.nextUrl.clone();
      cleanUrl.pathname = `/admin/${sub}`;
      return NextResponse.redirect(cleanUrl);
    }

    // Token is valid — refresh if less than 1 day remains
    if (shouldRefresh(payload)) {
      const newToken = await refreshToken(payload);
      const response = NextResponse.next();
      response.cookies.set("msj_admin_token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 3,
      });
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return response;
    }

    const passResponse = NextResponse.next();
    passResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return passResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
