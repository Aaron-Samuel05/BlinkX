import { after, NextResponse } from "next/server";
import { insertBooking, syncBooking } from "@/lib/bookings";
import { DATE_RE, todayInIndia, UGC_TIME_RE } from "@/lib/slots";

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  const name = String(body?.name || "").trim();
  const phone = String(body?.phone || "").trim();
  const date = String(body?.date || "").trim();
  const time = String(body?.time || "").trim();
  const phoneDigits = phone.replace(/\D/g, "");

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ success: false, message: "Please enter your name." }, { status: 400 });
  }
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    return NextResponse.json({ success: false, message: "Please enter a valid phone number." }, { status: 400 });
  }
  if (!DATE_RE.test(date) || !UGC_TIME_RE.test(time)) {
    return NextResponse.json({ success: false, message: "Please choose a preferred date and time." }, { status: 400 });
  }
  if (date < todayInIndia()) {
    return NextResponse.json({ success: false, message: "Please choose today or a future date." }, { status: 400 });
  }

  try {
    const booking = await insertBooking({
      kind: "ugc",
      name,
      phone: phone.slice(0, 25),
      packageLabel: "UGC Content",
      scheduledDate: date,
      timeSlot: time,
    });
    after(() => syncBooking(booking.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ugc enquiry failed", error);
    return NextResponse.json({ success: false, message: "Unable to submit your enquiry right now. Please try again." }, { status: 500 });
  }
}
