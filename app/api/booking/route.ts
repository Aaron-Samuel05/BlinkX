import { NextResponse } from "next/server";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbztGqt6QKUyvQNF6V9p5I9lKe_RVEZHeuHiC3c1UEtTLm8A-Ba1af6dIPZltc4PvMhFiA/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(body),
      redirect: "follow",
      cache: "no-store",
    });

    const text = await response.text();

    let result: unknown;
    try {
      result = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "The booking service returned an invalid response.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(result, { status: response.ok ? 200 : 502 });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to reach the booking service.",
      },
      { status: 502 }
    );
  }
}
