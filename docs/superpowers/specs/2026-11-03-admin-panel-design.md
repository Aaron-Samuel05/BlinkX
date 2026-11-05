# Blink X Admin Panel — Design

Date: 2026-11-03 · Status: approved in chat

## Goal
Every booking made on the public site (content-day calendar or UGC enquiry) lands in an admin
panel where the team tracks it through a payment pipeline and sees it alongside their Google
Calendar.

## Decisions
- **Storage:** Neon Postgres (`DATABASE_URL`), Drizzle ORM, Neon HTTP driver. Neon is the only
  booking store; the Google Sheet / Apps Script is retired. Old Sheet rows are imported once from
  a CSV export (`scripts/import-sheet.ts`).
- **Auth:** email + password. `admins` table (bcrypt hashes), `sessions` table (SHA-256 of a random
  token), httpOnly `SameSite=Lax` cookie, 30-day expiry. First admin via `scripts/create-admin.ts`.
- **Calendar:** one shared business Google Calendar, two-way.
  - Website bookings create an event; disconnect / delete removes it.
  - Admin Schedule shows bookings (orange) + Google events (grey). Events created by Blink X are
    tagged with `extendedProperties.private.blinkxBookingId` and not shown twice.
  - Public availability = website bookings ∪ Google free/busy (cached 60 s).
  - Refresh token encrypted with AES-256-GCM (`ENCRYPTION_KEY`).
- **Routing:** admin lives at `/admin` in this app with its own root layout (route groups), so it
  doesn't load the marketing site's CSS. `/admin` is `noindex` and disallowed in robots.

## Data model
- `bookings`: id, kind (`content_day` | `ugc`), name, phone, email, business, client_type,
  location, package_id, package_label, price, advance, amount_paid, scheduled_date (date, IST),
  time_slot, status (`scheduled` | `advance_paid` | `balance_pending` | `paid` | `closed`),
  position (double, ordering within a column), notes, next_follow_up (date), google_event_id,
  sync_error, source (`website` | `sheet_import`), created_at, updated_at.
  Unique (scheduled_date, time_slot) where kind = `content_day` — prevents double booking.
- `booking_events`: booking_id, from_status, to_status, admin_id, created_at.
- `admins`, `sessions`, `google_connection` (single row).

## Time-slot mapping (Asia/Kolkata, +05:30)
| Slot | Google event |
|---|---|
| Morning (9 AM to 12 PM) | 09:00–12:00 |
| Afternoon (12 PM to 4 PM) | 12:00–16:00 |
| Evening (4 PM to 7 PM) | 16:00–19:00 |
| Discuss on call | all-day, transparent (doesn't block free/busy) |
| UGC `HH:MM` | 30-minute event |

## Pages
- `/admin/login`
- `/admin` Dashboard — today's calls, payment follow-ups (advance paid / balance pending,
  overdue first), status counts. Items open the lead panel.
- `/admin/board` Kanban — five columns, dnd-kit drag (mouse/touch/keyboard), search, kind
  filter. Optimistic moves; one UPDATE per drop (fractional position); revert on failure.
- `/admin/schedule` — month / week / day calendar.
- `/admin/profile` — connect / disconnect Google, retry unsynced bookings, change password.
- Lead panel (shared): contact, call / WhatsApp links, status, amount paid, follow-up date,
  notes, history, delete.

## Failure handling
Google failures never block a booking: the row is saved with `sync_error` and can be retried
from Profile. If Google is disconnected the admin and public site keep working on website data.

## Testing
Vitest unit tests for slot mapping, position maths, token encryption. End-to-end check in a
browser: public booking → board card → drag → Google event (once OAuth keys are supplied).
