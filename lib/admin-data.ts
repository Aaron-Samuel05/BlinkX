import "server-only";
import { and, asc, desc, eq, gte, inArray, isNull, lte, ne, or, isNotNull, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { addDays, slotSortKey, todayInIndia } from "./slots";
import type { LeadCard } from "./status";

const b = schema.bookings;

const cardColumns = {
  id: b.id,
  kind: b.kind,
  name: b.name,
  phone: b.phone,
  business: b.business,
  packageLabel: b.packageLabel,
  price: b.price,
  advance: b.advance,
  amountPaid: b.amountPaid,
  scheduledDate: b.scheduledDate,
  timeSlot: b.timeSlot,
  status: b.status,
  position: b.position,
  nextFollowUp: b.nextFollowUp,
  syncError: b.syncError,
};

const bySlot = (a: LeadCard, c: LeadCard) => slotSortKey(a.timeSlot).localeCompare(slotSortKey(c.timeSlot));

/** Board: every open lead, plus the 60 most recently closed. */
export async function boardCards(): Promise<LeadCard[]> {
  const [open, closed] = await Promise.all([
    db.select(cardColumns).from(b).where(ne(b.status, "closed")).orderBy(asc(b.position)),
    db.select(cardColumns).from(b).where(eq(b.status, "closed")).orderBy(desc(b.updatedAt)).limit(60),
  ]);
  return [...open, ...closed.sort((x, y) => x.position - y.position)];
}

export async function dashboardData() {
  const today = todayInIndia();
  const [todays, followUps, upcoming, counts] = await Promise.all([
    db.select(cardColumns).from(b).where(eq(b.scheduledDate, today)),
    db.select(cardColumns).from(b)
      .where(inArray(b.status, ["advance_paid", "balance_pending"]))
      .orderBy(sql`${b.nextFollowUp} asc nulls last`, asc(b.scheduledDate)),
    db.select(cardColumns).from(b)
      .where(and(gte(b.scheduledDate, addDays(today, 1)), lte(b.scheduledDate, addDays(today, 7)), ne(b.status, "closed")))
      .orderBy(asc(b.scheduledDate)),
    db.select({ status: b.status, n: sql<number>`count(*)::int` }).from(b).groupBy(b.status),
  ]);
  return {
    today,
    todays: todays.sort(bySlot),
    followUps,
    upcoming: upcoming.sort((x, y) => x.scheduledDate.localeCompare(y.scheduledDate) || bySlot(x, y)),
    counts: Object.fromEntries(counts.map((c) => [c.status, c.n])) as Record<string, number>,
  };
}

export async function scheduleBookings(start: string, end: string) {
  return db.select(cardColumns).from(b)
    .where(and(gte(b.scheduledDate, start), lte(b.scheduledDate, end)));
}

export async function leadDetail(id: string) {
  const [[booking], history] = await Promise.all([
    db.select().from(b).where(eq(b.id, id)).limit(1),
    db
    .select({
      from: schema.bookingEvents.fromStatus,
      to: schema.bookingEvents.toStatus,
      at: schema.bookingEvents.createdAt,
      by: schema.admins.name,
    })
    .from(schema.bookingEvents)
    .leftJoin(schema.admins, eq(schema.admins.id, schema.bookingEvents.adminId))
    .where(eq(schema.bookingEvents.bookingId, id))
    .orderBy(desc(schema.bookingEvents.createdAt)),
  ]);
  if (!booking) return null;
  return { booking, history };
}

/** Upcoming bookings that never reached Google Calendar. */
export async function unsyncedBookings() {
  return db.select(cardColumns).from(b)
    .where(and(
      gte(b.scheduledDate, todayInIndia()),
      or(isNotNull(b.syncError), isNull(b.googleEventId)),
    ))
    .orderBy(asc(b.scheduledDate))
    .limit(50);
}
