import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { randomToken } from "@/lib/crypto";
import { googleAuthUrl, googleConfigured } from "@/lib/google";

export async function GET(request: Request) {
  if (!(await getAdmin())) return NextResponse.redirect(new URL("/admin/login", request.url));
  if (!googleConfigured()) return NextResponse.redirect(new URL("/admin/profile?google=not_configured", request.url));

  const state = randomToken(24);
  const response = NextResponse.redirect(googleAuthUrl(state));
  response.cookies.set("bx_google_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/admin/google",
    maxAge: 600,
  });
  return response;
}
