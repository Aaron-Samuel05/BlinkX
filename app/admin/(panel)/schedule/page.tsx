import { scheduleBookings } from "@/lib/admin-data";
import { getConnection, listGoogleEvents } from "@/lib/google";
import { addDays, todayInIndia } from "@/lib/slots";
import Schedule from "./Schedule";

export const metadata = { title: "Schedule" };

export default async function SchedulePage() {
  const today = todayInIndia();
  // Same 6-week grid the client computes for month view.
  const first = `${today.slice(0, 8)}01`;
  const start = addDays(first, -((new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7));
  const end = addDays(start, 41);

  const [bookings, connection] = await Promise.all([scheduleBookings(start, end), getConnection()]);
  let googleEvents: Awaited<ReturnType<typeof listGoogleEvents>> = [];
  let googleError: string | null = null;
  if (connection) {
    try {
      googleEvents = await listGoogleEvents(start, end);
    } catch (error) {
      googleError = error instanceof Error ? error.message : "Google Calendar error";
    }
  }

  return <Schedule today={today} connected={Boolean(connection)} initial={{ bookings, googleEvents, googleError }} />;
}
