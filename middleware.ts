import { NextResponse, type NextRequest } from "next/server";

// Cheap gate: bounce visitors without a session cookie. Pages and actions still verify the session.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!request.cookies.has("bx_admin")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
