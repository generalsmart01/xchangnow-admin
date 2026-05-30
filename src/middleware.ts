import { NextResponse, type NextRequest } from "next/server";
import { COOKIES } from "@/lib/constants";
import { decodeJwt } from "@/lib/auth/jwt";
import { isAdminRole } from "@/lib/auth/rbac";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get(COOKIES.access)?.value;

  // Already-authenticated admins shouldn't sit on the login page.
  if (pathname === "/login") {
    if (accessToken) {
      const payload = decodeJwt(accessToken);
      if (isAdminRole(payload?.role)) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const refreshToken = req.cookies.get(COOKIES.refresh)?.value;
    const payload = accessToken ? decodeJwt(accessToken) : null;

    // No usable session at all -> login.
    if (!accessToken && !refreshToken) {
      const url = new URL("/login", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    // If we can read the access token, enforce role now. (The 15m access
    // cookie may have expired while the 7d refresh cookie is still valid — in
    // that case we let the request through and the client refreshes on its
    // first API call; the admin layout re-checks role server-side.)
    if (payload) {
      if (!isAdminRole(payload.role)) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      // Staff list/detail: ADMIN + SUPER_ADMIN (matrix). Inviting is SUPER_ADMIN-only.
      if (pathname.startsWith("/admin/staff")) {
        if (payload.role !== "SUPER_ADMIN" && payload.role !== "ADMIN") {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
        if (
          pathname.startsWith("/admin/staff/invite") &&
          payload.role !== "SUPER_ADMIN"
        ) {
          return NextResponse.redirect(new URL("/admin/staff", req.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on app routes and the login page; skip static assets + API routes.
  matcher: ["/login", "/admin/:path*"],
};
