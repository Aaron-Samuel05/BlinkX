import { NextResponse, type NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth";
import { scheduleBookings } from "@/lib/admin-data";
import { listGoogleEvents } from "@/lib/google";
import { addDays, DATE_RE } from "@/lib/slots";

// Plain GET (not a server action) so several ranges can load in parallel.
export async function GET(request: NextRequest) {
  const start = request.nextUrl.searchParams.get("start") ?? "";
  const end = request.nextUrl.searchParams.get("end") ?? "";
  if (!DATE_RE.test(start) || !DATE_RE.test(end) || end < start || end > addDays(start, 62)) {
    return NextResponse.json({ error: "Invalid range." }, { status: 400 });
  }

  // Auth runs alongside the data queries; nothing is returned unless it passes.
  const [admin, bookings, google] = await Promise.all([
    getAdmin(),
    scheduleBookings(start, end),
    listGoogleEvents(start, end)
      .then((events) => ({ events, error: null as string | null }))
      .catch((e: Error) => ({ events: [], error: e.message })),
  ]);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(
    { bookings, googleEvents: google.events, googleError: google.error },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
