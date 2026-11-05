import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";
import { decrypt, encrypt } from "./crypto";
import { addDays, slotTiming } from "./slots";
import type { Booking } from "./db/schema";

const SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
];
const API = "https://www.googleapis.com/calendar/v3";

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function redirectUri() {
  return `${process.env.APP_URL || "http://localhost:3000"}/api/admin/google/callback`;
}

export function googleAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function tokenRequest(body: Record<string, string>) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      ...body,
    }),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error_description || json.error || "Google token request failed.");
  return json as { access_token: string; expires_in: number; refresh_token?: string; id_token?: string };
}

/** Finish OAuth: store the encrypted refresh token for the shared business calendar. */
export async function connectGoogle(code: string, adminId: string) {
  const tokens = await tokenRequest({ code, grant_type: "authorization_code", redirect_uri: redirectUri() });
  if (!tokens.refresh_token) throw new Error("Google did not return a refresh token. Please try connecting again.");
  // The id_token came straight from Google's token endpoint over TLS, so its payload can be read directly.
  const payload = JSON.parse(Buffer.from((tokens.id_token || "..").split(".")[1] || "", "base64url").toString() || "{}");
  const values = {
    googleEmail: String(payload.email || "Google account"),
    calendarId: "primary",
    refreshTokenEnc: encrypt(tokens.refresh_token),
    accessToken: tokens.access_token,
    accessTokenExpiresAt: new Date(Date.now() + (tokens.expires_in - 60) * 1000),
    connectedBy: adminId,
    connectedAt: new Date(),
  };
  await db.insert(schema.googleConnection).values({ id: 1, ...values })
    .onConflictDoUpdate({ target: schema.googleConnection.id, set: values });
  busyCache.clear();
  tokenMemo = null;
}

export async function getConnection() {
  const [row] = await db.select().from(schema.googleConnection).where(eq(schema.googleConnection.id, 1)).limit(1);
  return row ?? null;
}

export async function disconnectGoogle() {
  const conn = await getConnection();
  if (!conn) return;
  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(decrypt(conn.refreshTokenEnc))}`, { method: "POST" });
  } catch {
    // Revocation is best effort; the stored token is deleted either way.
  }
  await db.delete(schema.googleConnection).where(eq(schema.googleConnection.id, 1));
  busyCache.clear();
  tokenMemo = null;
}

// Saves a database round trip per Google call. Re-checked every 5 minutes so a
// disconnect made on another server instance takes effect quickly.
let tokenMemo: { token: string; calendarId: string; until: number } | null = null;

async function accessToken() {
  if (tokenMemo && tokenMemo.until > Date.now()) return { token: tokenMemo.token, calendarId: tokenMemo.calendarId };
  const conn = await getConnection();
  if (!conn) return null;
  const remember = (token: string, expiresAt: Date) => {
    tokenMemo = { token, calendarId: conn.calendarId, until: Math.min(expiresAt.getTime(), Date.now() + 5 * 60_000) };
    return { token, calendarId: conn.calendarId };
  };
  if (conn.accessToken && conn.accessTokenExpiresAt && conn.accessTokenExpiresAt > new Date()) {
    return remember(conn.accessToken, conn.accessTokenExpiresAt);
  }
  const fresh = await tokenRequest({ grant_type: "refresh_token", refresh_token: decrypt(conn.refreshTokenEnc) });
  const expiresAt = new Date(Date.now() + (fresh.expires_in - 60) * 1000);
  await db.update(schema.googleConnection).set({ accessToken: fresh.access_token, accessTokenExpiresAt: expiresAt })
    .where(eq(schema.googleConnection.id, 1));
  return remember(fresh.access_token, expiresAt);
}

async function calendarFetch(path: string, init: RequestInit = {}) {
  const auth = await accessToken();
  if (!auth) return null;
  const res = await fetch(`${API}${path.replace("{cal}", encodeURIComponent(auth.calendarId))}`, {
    ...init,
    headers: { Authorization: `Bearer ${auth.token}`, "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (res.status === 204 || res.status === 410 || (init.method === "DELETE" && res.status === 404)) return {};
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || `Google Calendar error ${res.status}`);
  return json;
}

// ---- Free/busy for public availability (60 s cache per instance) ----

type Busy = { start: string; end: string };
const busyCache = new Map<string, { at: number; busy: Busy[] }>();

export async function busyBetween(startDate: string, endDate: string): Promise<Busy[]> {
  const key = `${startDate}|${endDate}`;
  const hit = busyCache.get(key);
  if (hit && Date.now() - hit.at < 60_000) return hit.busy;
  try {
    const auth = await accessToken();
    if (!auth) return [];
    const json = await calendarFetch("/freeBusy", {
      method: "POST",
      body: JSON.stringify({
        timeMin: `${startDate}T00:00:00+05:30`,
        timeMax: `${addDays(endDate, 1)}T00:00:00+05:30`,
        timeZone: "Asia/Kolkata",
        items: [{ id: auth.calendarId }],
      }),
    });
    const busy: Busy[] = json?.calendars?.[auth.calendarId]?.busy ?? [];
    busyCache.set(key, { at: Date.now(), busy });
    return busy;
  } catch {
    return []; // Availability falls back to website bookings only.
  }
}

// ---- Events for the admin Schedule page ----

export type CalendarEvent = { id: string; title: string; start: string; end: string; allDay: boolean; link?: string };

export async function listGoogleEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: `${startDate}T00:00:00+05:30`,
    timeMax: `${addDays(endDate, 1)}T00:00:00+05:30`,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "500",
    timeZone: "Asia/Kolkata",
  });
  const json = await calendarFetch(`/calendars/{cal}/events?${params}`);
  if (!json) return [];
  return (json.items ?? [])
    .filter((e: any) => e.status !== "cancelled" && !e.extendedProperties?.private?.blinkxBookingId)
    .map((e: any) => ({
      id: e.id,
      title: e.summary || "(busy)",
      start: e.start?.dateTime ?? e.start?.date,
      end: e.end?.dateTime ?? e.end?.date,
      allDay: !e.start?.dateTime,
      link: e.htmlLink,
    }));
}

// ---- Booking → Google event ----

function eventBody(b: Booking) {
  const timing = slotTiming(b.kind, b.scheduledDate, b.timeSlot);
  const what = b.kind === "ugc" ? "UGC enquiry" : b.packageLabel || "Content day";
  const lines = [
    `Phone: ${b.phone}`,
    b.email && `Email: ${b.email}`,
    b.business && `Business: ${b.business}`,
    b.location && `Location: ${b.location}`,
    `Plan: ${what}`,
    `Preferred time: ${b.timeSlot}`,
    `Admin: ${process.env.APP_URL || ""}/admin/board?lead=${b.id}`,
  ].filter(Boolean);
  return {
    summary: `Blink X call · ${b.name}`,
    description: lines.join("\n"),
    start: timing.allDay ? { date: timing.date } : { dateTime: timing.start, timeZone: "Asia/Kolkata" },
    end: timing.allDay ? { date: addDays(timing.date, 1) } : { dateTime: timing.end, timeZone: "Asia/Kolkata" },
    // All-day "discuss on call" entries shouldn't make the whole day look busy.
    transparency: timing.allDay ? "transparent" : "opaque",
    extendedProperties: { private: { blinkxBookingId: b.id } },
  };
}

/** Creates or updates the booking's event. Returns the event id, or null when no calendar is connected. */
export async function upsertBookingEvent(b: Booking): Promise<string | null> {
  const body = JSON.stringify(eventBody(b));
  if (b.googleEventId) {
    const json = await calendarFetch(`/calendars/{cal}/events/${encodeURIComponent(b.googleEventId)}`, { method: "PATCH", body });
    return json ? b.googleEventId : null;
  }
  const json = await calendarFetch(`/calendars/{cal}/events`, { method: "POST", body });
  busyCache.clear();
  return json?.id ?? null;
}

export async function deleteBookingEvent(eventId: string) {
  await calendarFetch(`/calendars/{cal}/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });
  busyCache.clear();
}
