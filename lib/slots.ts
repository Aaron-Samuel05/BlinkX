// Booking time slots and India-time helpers shared by the public site, admin and Google sync.

export const IST_OFFSET = "+05:30";

export const CONTENT_SLOTS = [
  "Morning (9 AM to 12 PM)",
  "Afternoon (12 PM to 4 PM)",
  "Evening (4 PM to 7 PM)",
  "Discuss on call",
] as const;

const SLOT_WINDOWS: Record<string, [string, string]> = {
  "Morning (9 AM to 12 PM)": ["09:00", "12:00"],
  "Afternoon (12 PM to 4 PM)": ["12:00", "16:00"],
  "Evening (4 PM to 7 PM)": ["16:00", "19:00"],
};

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const UGC_TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function todayInIndia(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function addMinutes(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export type SlotTiming =
  | { allDay: true; date: string }
  | { allDay: false; start: string; end: string };

/** Where a booking sits on the calendar. Times are RFC 3339 in India time. */
export function slotTiming(kind: "content_day" | "ugc", date: string, slot: string): SlotTiming {
  if (kind === "ugc" && UGC_TIME_RE.test(slot)) {
    return { allDay: false, start: `${date}T${slot}:00${IST_OFFSET}`, end: `${date}T${addMinutes(slot, 30)}:00${IST_OFFSET}` };
  }
  const window = SLOT_WINDOWS[slot];
  if (window) {
    return { allDay: false, start: `${date}T${window[0]}:00${IST_OFFSET}`, end: `${date}T${window[1]}:00${IST_OFFSET}` };
  }
  return { allDay: true, date };
}

/** Content slots on `date` that overlap any busy interval. "Discuss on call" is never blocked by Google. */
export function slotsBlockedByBusy(date: string, busy: { start: string; end: string }[]) {
  const blocked: string[] = [];
  for (const [slot, [from, to]] of Object.entries(SLOT_WINDOWS)) {
    const s = Date.parse(`${date}T${from}:00${IST_OFFSET}`);
    const e = Date.parse(`${date}T${to}:00${IST_OFFSET}`);
    if (busy.some((b) => Date.parse(b.start) < e && Date.parse(b.end) > s)) blocked.push(slot);
  }
  return blocked;
}

/** Sort key so a day's calls list in time order. */
export function slotSortKey(slot: string) {
  if (UGC_TIME_RE.test(slot)) return slot;
  return SLOT_WINDOWS[slot]?.[0] ?? "99:99";
}

export function slotLabel(slot: string) {
  if (UGC_TIME_RE.test(slot)) {
    const [h, m] = slot.split(":").map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  }
  return slot === "Discuss on call" ? "Flexible" : slot.split(" (")[0];
}
