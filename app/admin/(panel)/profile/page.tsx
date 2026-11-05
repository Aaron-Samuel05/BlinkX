import { CalendarDays } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { unsyncedBookings } from "@/lib/admin-data";
import { getConnection, googleConfigured } from "@/lib/google";
import { formatDate } from "@/lib/status";
import { slotLabel } from "@/lib/slots";
import LeadButton from "../../_components/LeadButton";
import { DisconnectButton, PasswordForm, RetrySyncButton } from "./ProfileClient";

export const metadata = { title: "Profile" };

const GOOGLE_MESSAGES: Record<string, { text: string; ok?: boolean }> = {
  connected: { text: "Google Calendar connected.", ok: true },
  denied: { text: "Google access was not granted." },
  state_mismatch: { text: "The sign-in link expired. Please try connecting again." },
  not_configured: { text: "Google OAuth keys aren’t set on the server yet (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)." },
  error: { text: "Couldn’t connect Google Calendar. Please try again." },
};

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ google?: string }> }) {
  const [admin, connection, { google }] = await Promise.all([requireAdmin(), getConnection(), searchParams]);
  const unsynced = connection ? await unsyncedBookings() : [];
  const notice = google ? GOOGLE_MESSAGES[google] : undefined;

  return (
    <>
      <div className="pageHead">
        <div>
          <h1>Profile</h1>
          <p>{admin.name} · {admin.email}</p>
        </div>
      </div>

      <div className="profileGrid">
        <section className="card profileSection">
          <h2>Google Calendar</h2>
          <p className="muted">Website bookings are added to this calendar automatically, and time you’re busy there is blocked on the public booking calendar.</p>
          {notice && <p className={notice.ok ? "success" : "error"} role="status">{notice.text}</p>}

          <div className="connectRow">
            <span className="gIcon"><CalendarDays size={20} /></span>
            <div>
              <b>{connection ? connection.googleEmail : "Not connected"}</b>
              <small className="muted">
                {connection ? `Connected ${new Date(connection.connectedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : "Shared by all admins"}
              </small>
            </div>
            {connection
              ? <DisconnectButton />
              : googleConfigured()
                ? <a className="btn small accent" href="/api/admin/google/connect">Connect</a>
                : <span className="muted" style={{ fontSize: 12 }}>Keys not set</span>}
          </div>

          {connection && (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <b style={{ fontSize: 13 }}>{unsynced.length ? `${unsynced.length} upcoming booking${unsynced.length > 1 ? "s" : ""} not on Google` : "All upcoming bookings are synced"}</b>
                {unsynced.length > 0 && <RetrySyncButton />}
              </div>
              {unsynced.length > 0 && (
                <div className="card rowList" style={{ boxShadow: "none" }}>
                  {unsynced.slice(0, 8).map((l) => (
                    <LeadButton key={l.id} lead={l} className="row">
                      <span className="rowTime">{formatDate(l.scheduledDate)}<small>{slotLabel(l.timeSlot)}</small></span>
                      <span className="rowMain"><b>{l.name}</b><small>{l.syncError ?? "Waiting to sync"}</small></span>
                      <span />
                    </LeadButton>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        <section className="card profileSection">
          <h2>Password</h2>
          <PasswordForm />
        </section>
      </div>
    </>
  );
}
