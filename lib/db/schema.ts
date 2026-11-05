import { sql } from "drizzle-orm";
import {
  date,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const bookingStatus = pgEnum("booking_status", [
  "scheduled",
  "advance_paid",
  "balance_pending",
  "paid",
  "closed",
]);
export const bookingKind = pgEnum("booking_kind", ["content_day", "ugc"]);

export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("sessions_admin_idx").on(t.adminId)]
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: bookingKind("kind").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    business: text("business"),
    clientType: text("client_type"),
    location: text("location"),
    packageId: text("package_id"),
    packageLabel: text("package_label"),
    price: integer("price"),
    advance: integer("advance"),
    amountPaid: integer("amount_paid").notNull().default(0),
    scheduledDate: date("scheduled_date").notNull(),
    timeSlot: text("time_slot").notNull(),
    status: bookingStatus("status").notNull().default("scheduled"),
    position: doublePrecision("position").notNull().default(0),
    notes: text("notes"),
    nextFollowUp: date("next_follow_up"),
    googleEventId: text("google_event_id"),
    syncError: text("sync_error"),
    source: text("source").notNull().default("website"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("bookings_content_slot_uq")
      .on(t.scheduledDate, t.timeSlot)
      .where(sql`${t.kind} = 'content_day'`),
    index("bookings_status_position_idx").on(t.status, t.position),
    index("bookings_date_idx").on(t.scheduledDate),
  ]
);

export const bookingEvents = pgTable(
  "booking_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    fromStatus: bookingStatus("from_status"),
    toStatus: bookingStatus("to_status").notNull(),
    adminId: uuid("admin_id").references(() => admins.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("booking_events_booking_idx").on(t.bookingId)]
);

// Single row (id = 1): the shared business calendar.
export const googleConnection = pgTable("google_connection", {
  id: integer("id").primaryKey().default(1),
  googleEmail: text("google_email").notNull(),
  calendarId: text("calendar_id").notNull().default("primary"),
  refreshTokenEnc: text("refresh_token_enc").notNull(),
  accessToken: text("access_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  connectedBy: uuid("connected_by").references(() => admins.id, { onDelete: "set null" }),
  connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Booking = typeof bookings.$inferSelect;
export type BookingStatus = (typeof bookingStatus.enumValues)[number];
export type Admin = typeof admins.$inferSelect;
