"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { leadCache, useOpenLead } from "../../_components/leadCache";
import { addDays, slotLabel, slotTiming } from "@/lib/slots";
import { formatDate, type LeadCard } from "@/lib/status";
import type { CalendarEvent } from "@/lib/google";

type View = "month" | "week" | "day";
type Data = { bookings: LeadCard[]; googleEvents: CalendarEvent[]; googleError: string | null };
type Item = {
  key: string;
  type: "booking" | "google";
  title: string;
  sub?: string;
  date: string;
  allDay: boolean;
  start: number; // minutes from midnight, IST
  end: number;
  lead?: LeadCard;
  link?: string;
};

const FIRST_HOUR = 7;
const LAST_HOUR = 22;
const HOUR_PX = 52;
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const mondayIndex = (date: string) => (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;

function rangeFor(view: View, anchor: string): [string, string] {
  if (view === "day") return [anchor, anchor];
  if (view === "week") {
    const start = addDays(anchor, -mondayIndex(anchor));
    return [start, addDays(start, 6)];
  }
  const first = `${anchor.slice(0, 8)}01`;
  const start = addDays(first, -mondayIndex(first));
  return [start, addDays(start, 41)];
}

function shift(view: View, anchor: string, dir: 1 | -1) {
  if (view === "day") return addDays(anchor, dir);
  if (view === "week") return addDays(anchor, 7 * dir);
  const d = new Date(`${anchor.slice(0, 8)}01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + dir);
  return d.toISOString().slice(0, 10);
}

const istParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});
function toIst(iso: string) {
  const p = Object.fromEntries(istParts.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}
const minutesOf = (rfc: string) => Number(rfc.slice(11, 13)) * 60 + Number(rfc.slice(14, 16));
const clock = (m: number) => `${((Math.floor(m / 60) + 11) % 12) + 1}${m % 60 ? `:${String(m % 60).padStart(2, "0")}` : ""}${m < 720 ? "am" : "pm"}`;

function toItems(data: Data): Item[] {
  const items: Item[] = [];
  for (const lead of data.bookings) {
    const t = slotTiming(lead.kind, lead.scheduledDate, lead.timeSlot);
    items.push({
      key: `b-${lead.id}`, type: "booking", title: lead.name, sub: slotLabel(lead.timeSlot), date: lead.scheduledDate,
      allDay: t.allDay, start: t.allDay ? 0 : minutesOf(t.start), end: t.allDay ? 0 : minutesOf(t.end), lead,
    });
  }
  for (const ev of data.googleEvents) {
    if (ev.allDay) {
      for (let d = ev.start.slice(0, 10), n = 0; d < ev.end.slice(0, 10) && n < 62; d = addDays(d, 1), n++) {
        items.push({ key: `g-${ev.id}-${d}`, type: "google", title: ev.title, date: d, allDay: true, start: 0, end: 0, link: ev.link });
      }
    } else {
      const s = toIst(ev.start), e = toIst(ev.end);
      const end = e.date === s.date ? e.minutes : 24 * 60;
      items.push({ key: `g-${ev.id}`, type: "google", title: ev.title, sub: clock(s.minutes), date: s.date, allDay: false, start: s.minutes, end: Math.max(end, s.minutes + 15), link: ev.link });
    }
  }
  return items.sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start - b.start);
}

/** Side-by-side lanes for overlapping timed items. */
function layout(items: Item[]) {
  const lanes: number[] = [];
  const placed = items.map((it) => {
    let lane = lanes.findIndex((end) => end <= it.start);
    if (lane === -1) { lane = lanes.length; lanes.push(it.end); } else lanes[lane] = it.end;
    return { it, lane };
  });
  return placed.map((p) => ({ ...p, lanes: lanes.length }));
}

export default function Schedule({ today, initial, connected }: { today: string; initial: Data; connected: boolean }) {
  const [view, setView] = useState<View>("month");
  const [anchor, setAnchor] = useState(today);
  const cache = useRef(new Map<string, Data>([[rangeFor("month", today).join("|"), initial]]));
  const inflight = useRef(new Map<string, Promise<Data>>());
  const [data, setData] = useState<Data>(initial);
  const [loading, setLoading] = useState(false);
  const [nowMin, setNowMin] = useState<number | null>(null);
  const openLead = useOpenLead();
  const [start, end] = rangeFor(view, anchor);

  /** Cached data whose range covers [s, e], e.g. week/day views inside a loaded month. */
  const covering = useCallback((s: string, e: string) => {
    for (const [key, d] of cache.current) {
      const [cs, ce] = key.split("|");
      if (cs <= s && ce >= e) return d;
    }
    return undefined;
  }, []);

  const load = useCallback((s: string, e: string) => {
    const key = `${s}|${e}`;
    const hit = covering(s, e);
    if (hit) return Promise.resolve(hit);
    if (!inflight.current.has(key)) {
      inflight.current.set(key, fetch(`/api/admin/schedule?start=${s}&end=${e}`).then((r) => {
        if (!r.ok) throw new Error(`Schedule request failed (${r.status})`);
        return r.json() as Promise<Data>;
      }).then((d) => {
        cache.current.set(key, d);
        inflight.current.delete(key);
        return d;
      }).catch((err) => { inflight.current.delete(key); throw err; }));
    }
    return inflight.current.get(key)!;
  }, [covering]);

  // Always fetch whole month grids: they contain every week/day view of that month,
  // so switching views and stepping through weeks/days rarely waits on the network.
  const month = anchor.slice(0, 7);
  useEffect(() => {
    let cancelled = false;
    const [ms, me] = rangeFor("month", `${month}-01`);
    const hit = covering(ms, me);
    if (hit) setData(hit);
    else setLoading(true);
    load(ms, me)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    for (const dir of [1, -1] as const) {
      const [ns, ne] = rangeFor("month", shift("month", `${month}-01`, dir));
      load(ns, ne).catch(() => {});
    }
    return () => { cancelled = true; };
  }, [month, load, covering]);

  useEffect(() => {
    const tick = () => setNowMin(toIst(new Date().toISOString()).minutes);
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  const items = useMemo(() => toItems(data), [data]);
  const byDate = useMemo(() => {
    const map = new Map<string, Item[]>();
    items.forEach((it) => map.set(it.date, [...(map.get(it.date) ?? []), it]));
    return map;
  }, [items]);

  const activate = (it: Item) => {
    if (it.lead) { leadCache.set(it.lead.id, it.lead); openLead(it.lead); }
  };

  const Chip = ({ it }: { it: Item }) =>
    it.type === "booking"
      ? <button type="button" className="chip booking" onClick={() => activate(it)} title={`${it.title} · ${it.sub}`}>{it.allDay ? "" : `${clock(it.start)} `}{it.title}</button>
      : <a className="chip google" href={it.link} target="_blank" rel="noopener noreferrer" title={it.title}>{it.allDay ? "" : `${it.sub} `}{it.title}</a>;

  const title = view === "month"
    ? formatDate(anchor, { month: "long", year: "numeric" })
    : view === "week"
      ? `${formatDate(start)} – ${formatDate(end, { day: "numeric", month: "short", year: "numeric" })}`
      : formatDate(anchor, { weekday: "long", day: "numeric", month: "long" });

  const days = view === "week" ? Array.from({ length: 7 }, (_, i) => addDays(start, i)) : [anchor];

  return (
    <>
      <div className="pageHead">
        <div>
          <h1>Schedule</h1>
          <p>Website bookings alongside your Google Calendar.</p>
        </div>
        <div className="segmented" role="group" aria-label="Calendar view">
          {(["month", "week", "day"] as const).map((v) => (
            <button key={v} className={view === v ? "on" : ""} onClick={() => setView(v)} aria-pressed={view === v}>{v[0].toUpperCase() + v.slice(1)}</button>
          ))}
        </div>
      </div>

      {!connected && <div className="warn" style={{ marginBottom: 12 }}>Google Calendar isn’t connected. <Link href="/admin/profile" style={{ textDecoration: "underline" }}>Connect it in Profile</Link> to see your events here.</div>}
      {connected && data.googleError && <div className="warn" style={{ marginBottom: 12 }}>Couldn’t load Google events: {data.googleError}</div>}

      <div className="calToolbar">
        <button className="iconBtn" onClick={() => setAnchor(shift(view, anchor, -1))} aria-label="Previous"><ChevronLeft size={17} /></button>
        <button className="iconBtn" onClick={() => setAnchor(shift(view, anchor, 1))} aria-label="Next"><ChevronRight size={17} /></button>
        <button className="btn small" onClick={() => setAnchor(today)}>Today</button>
        <h2 aria-live="polite">{title}</h2>
        <div className="legend">
          <span><i className="dot" style={{ background: "var(--orange-2)" }} />Bookings</span>
          <span><i className="dot" style={{ background: "#9a9a95" }} />Google Calendar</span>
        </div>
      </div>

      <div className={`card calCard ${loading ? "loading" : ""}`}>
        {view === "month" ? (
          <div className="monthGrid">
            {DOW.map((d) => <div key={d} className="dow">{d}</div>)}
            {Array.from({ length: 42 }, (_, i) => {
              const date = addDays(start, i);
              const list = byDate.get(date) ?? [];
              return (
                <div key={date} className={`dayCell ${date.slice(0, 7) !== anchor.slice(0, 7) ? "other" : ""} ${date === today ? "today" : ""}`}>
                  <button className="dayNum" onClick={() => { setAnchor(date); setView("day"); }} aria-label={formatDate(date, { day: "numeric", month: "long" })}>{Number(date.slice(8))}</button>
                  {list.slice(0, 3).map((it) => <Chip key={it.key} it={it} />)}
                  {list.length > 3 && <button className="more" onClick={() => { setAnchor(date); setView("day"); }}>+{list.length - 3} more</button>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="timeGrid" style={{ ["--days" as string]: days.length }}>
            <div className="timeHead" />
            {days.map((d) => (
              <div key={d} className={`timeHead ${d === today ? "today" : ""}`}>
                <small>{formatDate(d, { weekday: "short" })}</small><b>{Number(d.slice(8))}</b>
              </div>
            ))}
            <div className="allDayLabel">all-day</div>
            {days.map((d) => (
              <div key={d} className="allDayRow">
                {(byDate.get(d) ?? []).filter((it) => it.allDay).map((it) => <Chip key={it.key} it={it} />)}
              </div>
            ))}
            <div className="hours">
              {Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => <div key={i} className="hourLabel">{clock((FIRST_HOUR + i) * 60)}</div>)}
            </div>
            {days.map((d) => {
              const timed = (byDate.get(d) ?? []).filter((it) => !it.allDay && it.end > FIRST_HOUR * 60 && it.start < LAST_HOUR * 60);
              return (
                <div key={d} className="dayCol" style={{ height: (LAST_HOUR - FIRST_HOUR) * HOUR_PX }}>
                  {d === today && nowMin != null && nowMin >= FIRST_HOUR * 60 && nowMin <= LAST_HOUR * 60 &&
                    <div className="nowLine" style={{ top: ((nowMin - FIRST_HOUR * 60) / 60) * HOUR_PX }} />}
                  {layout(timed).map(({ it, lane, lanes }) => {
                    const s = Math.max(it.start, FIRST_HOUR * 60), e = Math.min(it.end, LAST_HOUR * 60);
                    const style = {
                      top: ((s - FIRST_HOUR * 60) / 60) * HOUR_PX + 1,
                      height: Math.max(((e - s) / 60) * HOUR_PX - 2, 20),
                      left: `calc(${(lane / lanes) * 100}% + 3px)`,
                      right: "auto",
                      width: `calc(${100 / lanes}% - 6px)`,
                    };
                    const body = <><b>{it.title}</b>{clock(it.start)} – {clock(it.end)}</>;
                    return it.type === "booking"
                      ? <button key={it.key} className="block booking" style={style} onClick={() => activate(it)}>{body}</button>
                      : <a key={it.key} className="block google" style={style} href={it.link} target="_blank" rel="noopener noreferrer">{body}</a>;
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
