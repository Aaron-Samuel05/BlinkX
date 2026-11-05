import "server-only";
import { and, eq, gte, lte } from "drizzle-orm";
import { db, schema } from "./db";
import { busyBetween, upsertBookingEvent } from "./google";
import { addDays, slotsBlockedByBusy } from "./slots";

export const PACKAGES = {
  starter: { name: "Starter", reels: 8, price: 10000, advance: 5000 },
  growth: { name: "Growth", reels: 12, price: 15000, advance: 7500 },
  scale: { name: "Scale", reels: 18, price: 25000, advance: 12500 },
} as const;
export type PackageId = keyof typeof PACKAGES;

/** Taken content-day slots per date: website bookings plus Google busy time. */
export async function bookedSlots(start: string, end: string) {
  const [rows, busy] = await Promise.all([
    db
      .select({ date: schema.bookings.scheduledDate, slot: schema.bookings.timeSlot })
      .from(schema.bookings)
      .where(and(
        eq(schema.bookings.kind, "content_day"),
        gte(schema.bookings.scheduledDate, start),
        lte(schema.bookings.scheduledDate, end),
      )),
    busyBetween(start, end),
  ]);

  const booked: Record<string, string[]> = {};
  const add = (date: string, slot: string) => {
    (booked[date] ??= []).includes(slot) || booked[date].push(slot);
  };
  rows.forEach((r) => add(r.date, r.slot));
  if (busy.length) {
    for (let d = start; d <= end; d = addDays(d, 1)) {
      slotsBlockedByBusy(d, busy).forEach((slot) => add(d, slot));
    }
  }
  return booked;
}

type NewBooking = typeof schema.bookings.$inferInsert;

/** Inserts a booking at the top of "Scheduled". Throws "SLOT_TAKEN" if the content-day slot is already booked. */
export async function insertBooking(values: Omit<NewBooking, "position" | "status">) {
  try {
    const [row] = await db
      .insert(schema.bookings)
      .values({ ...values, status: "scheduled", position: -Date.now() / 1000 })
      .returning();
    await db.insert(schema.bookingEvents).values({ bookingId: row.id, toStatus: "scheduled" });
    return row;
  } catch (error: any) {
    const code = error?.code ?? error?.cause?.code;
    if (code === "23505") throw new Error("SLOT_TAKEN");
    throw error;
  }
}

/** Pushes a booking to Google Calendar, recording success or the failure reason on the row. */
export async function syncBooking(id: string) {
  const [booking] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)).limit(1);
  if (!booking) return;
  try {
    const eventId = await upsertBookingEvent(booking);
    await db.update(schema.bookings)
      .set({ googleEventId: eventId ?? booking.googleEventId, syncError: null })
      .where(eq(schema.bookings.id, id));
  } catch (error) {
    await db.update(schema.bookings)
      .set({ syncError: error instanceof Error ? error.message.slice(0, 300) : "Google sync failed" })
      .where(eq(schema.bookings.id, id));
  }
}
