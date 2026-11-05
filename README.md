# Blink X

Marketing site and booking flow for Blink X, plus an admin panel at `/admin`.

## Run
```
npm install
cp .env.example .env.local   # fill in values
npm run db:migrate           # create tables in Neon
npm run create-admin -- you@example.com "Your Name"   # prompts for a password
npm run dev
```

## How bookings flow
- The public booking calendar (`/api/booking`) and UGC enquiry form (`/api/ugc-enquiry`) save to Neon Postgres.
- A content-day date + time slot can only be booked once (enforced by a unique index).
- If Google Calendar is connected, each booking is added to it, and busy time in Google blocks those slots on the public calendar.

## Admin panel (`/admin`)
- **Dashboard** — today's calls, payment follow-ups, next 7 days.
- **Board** — Kanban: Scheduled → Advance paid → Balance pending → Paid → Closed. Drag to move; saves instantly.
- **Schedule** — month / week / day calendar with bookings and Google Calendar events.
- **Profile** — connect / disconnect Google Calendar, retry unsynced bookings, change password.

Add more admins with `npm run create-admin` (re-running for an existing email resets its password).

## Google Calendar setup
1. Google Cloud Console → enable **Google Calendar API**.
2. OAuth consent screen → add scopes `calendar.events` and `calendar.freebusy`; add the admin's Google account as a test user (or publish the app).
3. Credentials → OAuth client ID → **Web application**. Authorised redirect URIs:
   - `http://localhost:3000/api/admin/google/callback`
   - `https://www.theblinkx.com/api/admin/google/callback`
4. Put the client ID and secret in `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, then use **Profile → Connect**.

## Importing old Google Sheet bookings
Download the Sheet as CSV, then:
```
npm run import-sheet -- bookings.csv            # dry run
npm run import-sheet -- bookings.csv --commit   # import (run once)
```

## Tests
`npm test`
