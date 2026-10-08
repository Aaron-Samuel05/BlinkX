import { NextResponse } from "next/server";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwu5oV-aENTXrjyL4lnLLWTeMS17dsUB4oER3EkyMb0otCSF0I3CnwJKvNoQdS36gTq8A/exec";

const REQUEST_TIMEOUT_MS = 15000;

async function postToAppsScript(body: unknown) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const request = {
      method: "POST" as const,
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store" as const,
    };

    // Google Apps Script web apps can return a redirect before the actual
    // web-app response. Handle that redirect ourselves so the POST body and
    // method are preserved instead of relying on fetch's redirect behavior.
    let response = await fetch(APPS_SCRIPT_URL, {
      ...request,
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");

      if (!location) {
        throw new Error("Booking service redirect did not include a destination.");
      }

      response = await fetch(new URL(location, APPS_SCRIPT_URL), {
        ...request,
        redirect: "follow",
      });
    }

    return response;
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
