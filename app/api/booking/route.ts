import { after, NextResponse } from "next/server";
import { bookedSlots, insertBooking, PACKAGES, syncBooking, type PackageId } from "@/lib/bookings";
import { addDays, CONTENT_SLOTS, DATE_RE, todayInIndia } from "@/lib/slots";

const clean = (value: unknown, max = 200) => String(value ?? "").trim().slice(0, max);

export async function POST(request: Request) {
  let body: any;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  const date = clean(body?.date, 10);
  const time = clean(body?.time);
  const name = clean(body?.name, 100);
  const phone = clean(body?.phone, 25);
  const email = clean(body?.email, 200);
  const packageId = (clean(body?.packageId, 20) || "growth") as PackageId;
  const pkg = PACKAGES[packageId];

  if (!DATE_RE.test(date)) {
    return NextResponse.json({ success: false, message: "Please choose a valid booking date." }, { status: 400 });
  }
  if (date < todayInIndia()) {
    return NextResponse.json({ success: false, message: "That date has already passed. Please choose a future date." }, { status: 400 });
  }
  if (!(CONTENT_SLOTS as readonly string[]).includes(time)) {
    return NextResponse.json({ success: false, message: "Please choose a call time." }, { status: 400 });
  }
  if (name.length < 2) {
    return NextResponse.json({ success: false, message: "Please enter your name." }, { status: 400 });
  }
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return NextResponse.json({ success: false, message: "Please enter a valid phone number." }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400 });
  }
  if (!pkg) {
    return NextResponse.json({ success: false, message: "Please choose a package." }, { status: 400 });
  }

  const slotTaken = NextResponse.json(
    { success: false, booked: true, message: "This date and time slot is already booked. Please choose another time." },
    { status: 409 }
  );

  try {
    // Also catches slots the admin is busy in Google Calendar; the unique index covers website races.
    const taken = await bookedSlots(date, date);
    if (taken[date]?.includes(time)) return slotTaken;

    const booking = await insertBooking({
      kind: "content_day",
      name,
      phone,
      email: email || null,
      business: clean(body?.business) || null,
      clientType: clean(body?.type, 60) || null,
      location: clean(body?.location) || null,
      packageId,
      packageLabel: `${pkg.name} · ${pkg.reels} Reels`,
      price: pkg.price,
      advance: pkg.advance,
      scheduledDate: date,
      timeSlot: time,
    });
    after(() => syncBooking(booking.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_TAKEN") return slotTaken;
    console.error("booking failed", error);
    return NextResponse.json({ success: false, message: "We couldn't save your booking. Please try again." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = clean(searchParams.get("start"), 10);
  const end = clean(searchParams.get("end"), 10);

  if (!DATE_RE.test(start) || !DATE_RE.test(end) || end < start || end > addDays(start, 62)) {
    return NextResponse.json({ success: false, booked: {} }, { status: 400 });
  }

  try {
    return NextResponse.json({ success: true, booked: await bookedSlots(start, end) });
  } catch (error) {
    console.error("availability failed", error);
    return NextResponse.json({ success: false, booked: {} }, { status: 503 });
  }
}
