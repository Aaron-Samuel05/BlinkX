"use client";

import { useActionState, useState, useTransition } from "react";
import { RefreshCw, Unplug } from "lucide-react";
import { changePassword, disconnectCalendar, retryUnsynced } from "../../actions";

export function DisconnectButton() {
  const [pending, start] = useTransition();
  return (
    <button className="btn small danger" disabled={pending}
      onClick={() => confirm("Disconnect Google Calendar? New bookings won't be added to it until you reconnect.") && start(() => disconnectCalendar())}>
      <Unplug size={14} /> {pending ? "Disconnecting…" : "Disconnect"}
    </button>
  );
}

export function RetrySyncButton() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button className="btn small" disabled={pending} onClick={() => start(async () => {
        const r = await retryUnsynced();
        setMessage(r.failed ? `${r.synced} synced, ${r.failed} still failing` : `${r.synced} synced`);
      })}>
        <RefreshCw size={14} /> {pending ? "Syncing…" : "Retry sync"}
      </button>
      {message && <span className="muted" style={{ fontSize: 12 }}>{message}</span>}
    </div>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  return (
    <form action={action} style={{ display: "grid", gap: 12 }}>
      <label className="field"><span>Current password</span><input className="input" type="password" name="current" autoComplete="current-password" required /></label>
      <label className="field"><span>New password (min 10 characters)</span><input className="input" type="password" name="next" autoComplete="new-password" minLength={10} required /></label>
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      {state?.ok && <p className="success" role="status">Password updated.</p>}
      <button className="btn primary" disabled={pending} style={{ justifySelf: "start" }}>{pending ? "Updating…" : "Update password"}</button>
    </form>
  );
}
