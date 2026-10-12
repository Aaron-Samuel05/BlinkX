import { NextResponse } from "next/server";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwlc_zkuTbXR0seUy6HCssokbIdOoIb8rupSUF_ESybKR_j_7Wdf9NyMtVDP7LwCgnOFA/exec";

const REQUEST_TIMEOUT_MS = 30000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
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

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !time) {
      return NextResponse.json({ success: false, message: "Please choose a preferred date and time." }, { status: 400 });
    }
    const todayInIndia = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    if (date < todayInIndia) {
      return NextResponse.json({ success: false, message: "Please choose today or a future date." }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const upstream = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "ugc_enquiry",
          source: "UGC",
          type: "UGC Enquiry",
          package: "UGC Content",
          name,
          phone,
          date,
          time,
        }),
        redirect: "follow",
        cache: "no-store",
        signal: controller.signal,
      });
      const text = await upstream.text();
      let result: any;
      try {
        result = JSON.parse(text);
      } catch {
        return NextResponse.json({ success: false, message: "The enquiry service returned an unexpected response." }, { status: 502 });
      }
      if (!upstream.ok || !result?.success) {
        return NextResponse.json({ success: false, message: result?.message || "We couldn't save your enquiry. Please try again." }, { status: 502 });
      }
      return NextResponse.json({ success: true });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json({ success: false, message: "The enquiry service is taking too long to respond. Please try again." }, { status: 504 });
    }
    return NextResponse.json({ success: false, message: "Unable to submit your enquiry right now. Please try again." }, { status: 502 });
  }
}
