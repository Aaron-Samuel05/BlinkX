"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, MessageCircle, Phone, Trash2, X } from "lucide-react";
import { deleteLead, getLead, updateLead } from "../actions";
import { leadCache } from "./leadCache";
import { formatDate, formatINR, STATUSES, statusMeta, type StatusId } from "@/lib/status";
import { slotLabel } from "@/lib/slots";

type Detail = NonNullable<Awaited<ReturnType<typeof getLead>>>;
type FormState = { status: StatusId; amountPaid: string; nextFollowUp: string; notes: string };

export default function LeadDrawer() {
  const params = useSearchParams();
  const id = params.get("lead");
  const router = useRouter();
  const pathname = usePathname();

  const [detail, setDetail] = useState<Detail | null>(null);
  const [missing, setMissing] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const close = () => {
    const next = new URLSearchParams(params.toString());
    next.delete("lead");
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setDetail(null);
    setMissing(false);
    setError("");
    setSaved(false);
    const cached = leadCache.get(id);
    setForm(cached ? { status: cached.status, amountPaid: String(cached.amountPaid), nextFollowUp: cached.nextFollowUp ?? "", notes: "" } : null);
    getLead(id).then((d) => {
      if (cancelled) return;
      if (!d) return setMissing(true);
      setDetail(d);
      setForm({
        status: d.booking.status,
        amountPaid: String(d.booking.amountPaid),
        nextFollowUp: d.booking.nextFollowUp ?? "",
        notes: d.booking.notes ?? "",
      });
    }).catch(() => !cancelled && setError("Couldn't load this lead."));
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!id) return null;

  const cached = leadCache.get(id);
  const b = detail?.booking;
  const name = b?.name ?? cached?.name ?? "";
  const phone = b?.phone ?? cached?.phone ?? "";
  const digits = phone.replace(/\D/g, "");
  const waNumber = digits.length === 10 ? `91${digits}` : digits;
  const price = b?.price ?? cached?.price ?? null;
  const paid = Number(form?.amountPaid || 0);

  const dirty = Boolean(b && form && (
    form.status !== b.status ||
    Number(form.amountPaid || 0) !== b.amountPaid ||
    (form.nextFollowUp || null) !== (b.nextFollowUp || null) ||
    form.notes !== (b.notes ?? "")
  ));

  function save() {
    if (!form || !b) return;
    setError("");
    startTransition(async () => {
      const res = await updateLead(b.id, {
        status: form.status,
        amountPaid: Number(form.amountPaid || 0),
        nextFollowUp: form.nextFollowUp || null,
        notes: form.notes,
      });
      if (!res.ok) return setError(res.error);
      const fresh = await getLead(b.id);
      if (fresh) setDetail(fresh);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    });
  }

  function remove() {
    if (!b || !confirm(`Delete the lead for ${b.name}? This also removes its Google Calendar event.`)) return;
    startTransition(async () => {
      const res = await deleteLead(b.id);
      if (!res.ok) return setError(res.error);
      leadCache.delete(b.id);
      close();
    });
  }

  return (
    <>
      <div className="drawerBack" onClick={close} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="leadTitle">
        <button className="drawerClose" onClick={close} aria-label="Close"><X size={17} /></button>
        <div className="drawerHead">
          {missing ? <h2 id="leadTitle">Lead not found</h2> : <>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(b?.kind ?? cached?.kind) && <span className={`kindTag ${(b?.kind ?? cached?.kind) === "ugc" ? "ugc" : ""}`}>{(b?.kind ?? cached?.kind) === "ugc" ? "UGC" : "CONTENT DAY"}</span>}
              {form && <span className="pill" style={{ background: statusMeta(form.status).soft, color: statusMeta(form.status).color }}><i className="dot" style={{ background: statusMeta(form.status).color }} />{statusMeta(form.status).label}</span>}
            </div>
            <h2 id="leadTitle">{name || <span className="skeleton" style={{ display: "block", width: 180, height: 22 }} />}</h2>
            {phone && <div className="contactActions">
              <a className="btn small" href={`tel:${phone}`}><Phone size={14} /> Call</a>
              <a className="btn small" href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> WhatsApp</a>
            </div>}
          </>}
        </div>

        {!missing && <div className="drawerBody">
          {b?.syncError && <div className="warn"><AlertTriangle size={14} style={{ verticalAlign: -2 }} /> Not synced to Google Calendar: {b.syncError}</div>}

          <dl className="infoGrid">
            <div><dt>Preferred date</dt><dd>{(b ?? cached) ? formatDate((b ?? cached)!.scheduledDate, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "…"}</dd></div>
            <div><dt>Time</dt><dd>{(b ?? cached) ? slotLabel((b ?? cached)!.timeSlot) : "…"}</dd></div>
            <div><dt>Phone</dt><dd>{phone || "…"}</dd></div>
            <div><dt>Plan</dt><dd>{b?.packageLabel ?? cached?.packageLabel ?? "—"}</dd></div>
            {b?.email && <div><dt>Email</dt><dd>{b.email}</dd></div>}
            {b?.business && <div><dt>Business</dt><dd>{b.business}</dd></div>}
            {b?.clientType && <div><dt>Type</dt><dd>{b.clientType}</dd></div>}
            {b?.location && <div><dt>Location</dt><dd>{b.location}</dd></div>}
            <div><dt>Booked on</dt><dd>{b ? new Date(b.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "…"}</dd></div>
          </dl>

          {form && <>
            <div>
              <p className="sectionLabel">Status</p>
              <div className="statusPicker">
                {STATUSES.map((s) => (
                  <button key={s.id} type="button" className={form.status === s.id ? "on" : ""}
                    style={form.status === s.id ? { color: s.color, background: s.soft } : undefined}
                    onClick={() => setForm({ ...form, status: s.id })} disabled={!b}>
                    <i className="dot" style={{ background: s.color }} />{s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="sectionLabel">Payment</p>
              <div className="twoCol">
                <label className="field">
                  <span>Amount paid (₹)</span>
                  <input className="input" type="number" min={0} step={500} inputMode="numeric" value={form.amountPaid}
                    onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} disabled={!b} />
                </label>
                <label className="field">
                  <span>Next follow-up</span>
                  <input className="input" type="date" value={form.nextFollowUp}
                    onChange={(e) => setForm({ ...form, nextFollowUp: e.target.value })} disabled={!b} />
                </label>
              </div>
              <p className="muted" style={{ fontSize: 12, margin: "8px 0 0" }}>
                Total {formatINR(price)} · Advance {formatINR(b?.advance ?? cached?.advance)} · Balance {price != null ? formatINR(Math.max(price - paid, 0)) : "—"}
              </p>
            </div>

            <label className="field">
              <span>Notes</span>
              <textarea className="input" value={form.notes} placeholder="Call notes, shoot details, payment reference…"
                onChange={(e) => setForm({ ...form, notes: e.target.value })} disabled={!b} />
            </label>
          </>}

          {detail && detail.history.length > 0 && <div>
            <p className="sectionLabel">History</p>
            <ul className="history">
              {detail.history.map((h, i) => (
                <li key={i}>
                  <i className="dot" style={{ background: statusMeta(h.to).color, alignSelf: "center" }} />
                  <span>{h.from ? <>{statusMeta(h.from).label} → <b>{statusMeta(h.to).label}</b></> : <>Booked</>}{h.by ? ` · ${h.by}` : ""}</span>
                  <time>{new Date(h.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</time>
                </li>
              ))}
            </ul>
          </div>}

          {error && <p className="error" role="alert">{error}</p>}
        </div>}

        {!missing && <div className="drawerFoot">
          <button className="btn danger small" onClick={remove} disabled={!b || pending}><Trash2 size={14} /> Delete</button>
          <span style={{ marginLeft: "auto" }} className="success" aria-live="polite">{saved ? "Saved" : ""}</span>
          <button className="btn primary" onClick={save} disabled={!dirty || pending}>{pending ? "Saving…" : "Save changes"}</button>
        </div>}
      </aside>
    </>
  );
}
