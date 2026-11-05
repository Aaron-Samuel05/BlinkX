import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { dashboardData } from "@/lib/admin-data";
import { formatDate, formatINR, STATUSES, statusMeta, type LeadCard } from "@/lib/status";
import { slotLabel } from "@/lib/slots";
import LeadButton from "../_components/LeadButton";

export const metadata = { title: "Dashboard" };

function StatusPill({ status }: { status: string }) {
  const s = statusMeta(status);
  return <span className="pill" style={{ background: s.soft, color: s.color }}><i className="dot" style={{ background: s.color }} />{s.label}</span>;
}

function LeadRow({ lead, today, mode }: { lead: LeadCard; today: string; mode: "time" | "date" | "followUp" }) {
  const balance = lead.price != null ? Math.max(lead.price - lead.amountPaid, 0) : null;
  const overdue = mode === "followUp" && lead.nextFollowUp != null && lead.nextFollowUp < today;
  return (
    <LeadButton lead={lead} className="row">
      <span className="rowTime">
        {mode === "time" ? slotLabel(lead.timeSlot) : formatDate(mode === "followUp" ? lead.nextFollowUp ?? lead.scheduledDate : lead.scheduledDate)}
        <small>{mode === "date" ? slotLabel(lead.timeSlot) : mode === "followUp" ? (lead.nextFollowUp ? "follow-up" : "shoot date") : lead.kind === "ugc" ? "UGC" : "Content day"}</small>
      </span>
      <span className="rowMain">
        <b>{lead.name}</b>
        <small>{lead.phone}{lead.packageLabel ? ` · ${lead.packageLabel}` : ""}</small>
      </span>
      <span className="rowSide">
        <StatusPill status={lead.status} />
        {mode === "followUp" && <span className={overdue ? "overdue" : "muted"}>{overdue ? "Overdue · " : ""}{balance != null ? `${formatINR(balance)} due` : ""}</span>}
      </span>
    </LeadButton>
  );
}

export default async function Dashboard() {
  const { today, todays, followUps, upcoming, counts } = await dashboardData();
  const dueTotal = followUps.reduce((sum, l) => sum + (l.price != null ? Math.max(l.price - l.amountPaid, 0) : 0), 0);

  return (
    <>
      <div className="pageHead">
        <div>
          <h1>Dashboard</h1>
          <p>{formatDate(today, { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <Link className="btn" href="/admin/board">Open board <ArrowRight size={15} /></Link>
      </div>

      <div className="stats">
        {STATUSES.map((s) => (
          <Link key={s.id} href={`/admin/board#${s.id}`} className="card stat">
            <span><i className="dot" style={{ background: s.color }} />{s.label}</span>
            <b>{counts[s.id] ?? 0}</b>
          </Link>
        ))}
      </div>

      <div className="dashGrid">
        <section className="card panelCard">
          <header><h2>Today’s calls</h2><small>{todays.length} scheduled</small></header>
          <div className="rowList">
            {todays.length ? todays.map((l) => <LeadRow key={l.id} lead={l} today={today} mode="time" />) : <p className="empty">No calls today.</p>}
          </div>
        </section>

        <section className="card panelCard">
          <header><h2>Payment follow-ups</h2><small>{formatINR(dueTotal)} outstanding</small></header>
          <div className="rowList">
            {followUps.length ? followUps.map((l) => <LeadRow key={l.id} lead={l} today={today} mode="followUp" />) : <p className="empty">No pending payments. </p>}
          </div>
        </section>

        <section className="card panelCard">
          <header><h2>Next 7 days</h2><small>{upcoming.length} upcoming</small></header>
          <div className="rowList">
            {upcoming.length ? upcoming.map((l) => <LeadRow key={l.id} lead={l} today={today} mode="date" />) : <p className="empty">Nothing booked this week yet.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
