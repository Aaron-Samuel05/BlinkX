"use server";

import bcrypt from "bcryptjs";
import { eq, sql, type SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/lib/db";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { leadDetail, unsyncedBookings } from "@/lib/admin-data";
import { syncBooking } from "@/lib/bookings";
import { deleteBookingEvent, disconnectGoogle, getConnection } from "@/lib/google";
import { DATE_RE } from "@/lib/slots";
import { STATUS_IDS, type StatusId } from "@/lib/status";

type Result = { ok: true } | { ok: false; error: string };

// ---- Auth ----

export async function login(_: { error?: string; email?: string } | undefined, form: FormData) {
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const [admin] = await db.select().from(schema.admins).where(eq(schema.admins.email, email)).limit(1);
  // Always run bcrypt so response time doesn't reveal whether the email exists.
  const valid = await bcrypt.compare(password, admin?.passwordHash ?? "$2b$12$5J0gwA6ghJvxmfuNeLIQ1eQvpH3AE8OpJkD3xl.M..4erpIwLCxf6");
  if (!admin || !valid) return { error: "Incorrect email or password.", email };
  await createSession(admin.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePassword(_: { error?: string; ok?: boolean } | undefined, form: FormData) {
  const admin = await requireAdmin();
  const current = String(form.get("current") || "");
  const next = String(form.get("next") || "");
  if (next.length < 10) return { error: "New password must be at least 10 characters." };
  const [row] = await db.select().from(schema.admins).where(eq(schema.admins.id, admin.id)).limit(1);
  if (!row || !(await bcrypt.compare(current, row.passwordHash))) return { error: "Current password is incorrect." };
  await db.update(schema.admins).set({ passwordHash: await bcrypt.hash(next, 12) }).where(eq(schema.admins.id, admin.id));
  return { ok: true };
}

// ---- Leads ----

function isStatus(value: string): value is StatusId {
  return (STATUS_IDS as string[]).includes(value);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Updates a lead and records a status change in one statement (one database round trip).
 * Returns false if the lead doesn’t exist.
 */
async function applyChange(id: string, adminId: string, status: StatusId, changes: SQL) {
  const result = await db.execute(sql`
    with prev as (select status from bookings where id = ${id} for update),
    upd as (
      update bookings set status = ${status}::booking_status, ${changes}, updated_at = now()
      where id = ${id} returning id
    ),
    ins as (
      insert into booking_events (booking_id, from_status, to_status, admin_id)
      select ${id}::uuid, prev.status, ${status}::booking_status, ${adminId}::uuid from prev
      where prev.status <> ${status}::booking_status
    )
    select status from prev`);
  return result.rows.length > 0;
}

/** One statement per drag: new column and fractional position. */
export async function moveBooking(id: string, status: string, position: number): Promise<Result> {
  const admin = await requireAdmin();
  if (!UUID_RE.test(id) || !isStatus(status) || !Number.isFinite(position)) return { ok: false, error: "Invalid move." };
  const found = await applyChange(id, admin.id, status, sql`position = ${position}`);
  return found ? { ok: true } : { ok: false, error: "This lead no longer exists." };
}

export async function getLead(id: string) {
  if (!UUID_RE.test(id)) return null;
  const [, detail] = await Promise.all([requireAdmin(), leadDetail(id)]);
  return detail;
}

export async function updateLead(
  id: string,
  input: { status: string; amountPaid: number; nextFollowUp: string | null; notes: string }
): Promise<Result> {
  const admin = await requireAdmin();
  if (!UUID_RE.test(id) || !isStatus(input.status)) return { ok: false, error: "Invalid status." };
  if (!Number.isFinite(input.amountPaid) || input.amountPaid < 0) return { ok: false, error: "Amount paid must be 0 or more." };
  if (input.nextFollowUp && !DATE_RE.test(input.nextFollowUp)) return { ok: false, error: "Invalid follow-up date." };

  const found = await applyChange(id, admin.id, input.status, sql`
    amount_paid = ${Math.round(input.amountPaid)},
    next_follow_up = ${input.nextFollowUp || null},
    notes = ${input.notes.slice(0, 5000) || null}`);
  if (!found) return { ok: false, error: "This lead no longer exists." };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deleteLead(id: string): Promise<Result> {
  await requireAdmin();
  if (!UUID_RE.test(id)) return { ok: false, error: "Invalid lead." };
  const [row] = await db.delete(schema.bookings).where(eq(schema.bookings.id, id)).returning({ eventId: schema.bookings.googleEventId });
  if (row?.eventId) {
    try {
      await deleteBookingEvent(row.eventId);
    } catch {
      // The lead is gone either way; a stray calendar event can be removed by hand.
    }
  }
  revalidatePath("/admin", "layout");
  return { ok: true };
}

// ---- Google Calendar ----

export async function disconnectCalendar() {
  await requireAdmin();
  await disconnectGoogle();
  revalidatePath("/admin", "layout");
}

export async function retryUnsynced(): Promise<{ synced: number; failed: number }> {
  await requireAdmin();
  if (!(await getConnection())) return { synced: 0, failed: 0 };
  const pending = await unsyncedBookings();
  await Promise.all(pending.map((p) => syncBooking(p.id)));
  const left = await unsyncedBookings();
  revalidatePath("/admin", "layout");
  return { synced: pending.length - left.length, failed: left.length };
}
