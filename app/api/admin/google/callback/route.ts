import { NextResponse, type NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth";
import { connectGoogle } from "@/lib/google";

export async function GET(request: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.redirect(new URL("/admin/login", request.url));

  const { searchParams } = request.nextUrl;
  const back = (status: string) => {
    const res = NextResponse.redirect(new URL(`/admin/profile?google=${status}`, request.url));
    res.cookies.delete({ name: "bx_google_state", path: "/api/admin/google" });
    return res;
  };

  const state = searchParams.get("state");
  if (!state || state !== request.cookies.get("bx_google_state")?.value) return back("state_mismatch");
  if (searchParams.get("error")) return back("denied");

  const code = searchParams.get("code");
  if (!code) return back("error");
  try {
    await connectGoogle(code, admin.id);
    return back("connected");
  } catch (error) {
    console.error("google connect failed", error);
    return back("error");
  }
}
