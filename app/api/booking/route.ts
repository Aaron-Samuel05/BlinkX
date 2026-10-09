import { NextResponse } from "next/server";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwlc_zkuTbXR0seUy6HCssokbIdOoIb8rupSUF_ESybKR_j_7Wdf9NyMtVDP7LwCgnOFA/exec";

const REQUEST_TIMEOUT_MS = 30000;

async function getAvailabilityForDate(date: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({ start: date, end: date });
    const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });
    const text = await response.text();

    if (!response.ok) throw new Error("Availability service returned an error.");
    const result = JSON.parse(text);
    if (!result?.success || !result.booked || typeof result.booked !== "object") {
      throw new Error("Availability response was invalid.");
    }

    return result.booked as Record<string, string[]>;
  } finally {
    clearTimeout(timeout);
  }
}

async function postToAppsScript(body: unknown) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(body),
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requestedDate = String(body?.date || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      return NextResponse.json(
        { success: false, message: "Please choose a valid booking date." },
        { status: 400 }
      );
    }

    const todayInIndia = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    if (requestedDate < todayInIndia) {
      return NextResponse.json(
        { success: false, message: "That date has already passed. Please choose a future date." },
        { status: 400 }
      );
    }

    const requestedTime = String(body?.time || "").trim();
    if (!requestedTime) {
      return NextResponse.json(
        { success: false, message: "Please choose a call time." },
        { status: 400 }
      );
    }

    // Re-check the live sheet immediately before submitting, not just the browser's cached calendar.
    let bookedByDate: Record<string, string[]>;
    try {
      bookedByDate = await getAvailabilityForDate(requestedDate);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "We couldn't verify the latest availability. Please refresh the page and try again.",
        },
        { status: 503 }
      );
    }

    const bookedTimes = bookedByDate[requestedDate];
    if (Array.isArray(bookedTimes) && bookedTimes.includes(requestedTime)) {
      return NextResponse.json(
        {
          success: false,
          booked: true,
          message: "This date and time slot is already booked. Please choose another time.",
        },
        { status: 409 }
      );
    }

    const response = await postToAppsScript(body);
    const text = await response.text();

    let result: any;
    try {
      result = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "This time slot is already booked. Please choose another date or time.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(result, { status: response.ok ? 200 : 502 });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          message: "The booking service is taking too long to respond. Please try again.",
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to reach the booking service. Please try again.",
      },
      { status: 502 }
    );
  }
}


async function getFromAppsScript(start: string, end: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({ start, end });
    return await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = String(searchParams.get("start") || "").trim();
  const end = String(searchParams.get("end") || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
    return NextResponse.json({ success: false, booked: {} }, { status: 400 });
  }

  try {
    const response = await getFromAppsScript(start, end);
    const text = await response.text();

    try {
      const result = JSON.parse(text);
      if (!result?.success || typeof result.booked !== "object" || result.booked === null) {
        return NextResponse.json({ success: false, booked: {} }, { status: 200 });
      }
      return NextResponse.json({ success: true, booked: result.booked }, { status: 200 });
    } catch {
      return NextResponse.json({ success: false, booked: {} }, { status: 200 });
    }
  } catch {
    return NextResponse.json({ success: false, booked: {} }, { status: 200 });
  }
}
