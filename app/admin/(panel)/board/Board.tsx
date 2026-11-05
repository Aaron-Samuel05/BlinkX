"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle, CalendarDays, Clock3, Search } from "lucide-react";
import { moveBooking } from "../../actions";
import { leadCache, useOpenLead } from "../../_components/leadCache";
import { positionBetween } from "@/lib/positions";
import { formatDate, formatINR, STATUSES, type LeadCard, type StatusId } from "@/lib/status";
import { slotLabel } from "@/lib/slots";

type Columns = Record<StatusId, string[]>;

function group(cards: LeadCard[]): Columns {
  const cols = Object.fromEntries(STATUSES.map((s) => [s.id, [] as string[]])) as Columns;
  [...cards].sort((a, b) => a.position - b.position).forEach((c) => cols[c.status].push(c.id));
  return cols;
}

const CardBody = memo(function CardBody({ lead }: { lead: LeadCard }) {
  const balance = lead.price != null ? Math.max(lead.price - lead.amountPaid, 0) : null;
  return (
    <>
      <div className="leadTop">
        <b>{lead.name}</b>
        <span className={`kindTag ${lead.kind === "ugc" ? "ugc" : ""}`}>{lead.kind === "ugc" ? "UGC" : "DAY"}</span>
      </div>
      <div className="leadMeta">
        <span><CalendarDays size={12} />{formatDate(lead.scheduledDate)}</span>
        <span><Clock3 size={12} />{slotLabel(lead.timeSlot)}</span>
        {lead.syncError && <span title={`Not synced to Google: ${lead.syncError}`} style={{ color: "var(--danger)" }}><AlertTriangle size={12} />sync</span>}
      </div>
      {lead.packageLabel && <div className="leadMeta">{lead.packageLabel}</div>}
      {lead.price != null && (
        <div className="leadMoney">
          <span className="muted">Paid {formatINR(lead.amountPaid)}</span>
          <b>{balance ? `${formatINR(balance)} due` : "Settled"}</b>
        </div>
      )}
    </>
  );
});

function SortableCard({ lead, onOpen }: { lead: LeadCard; onOpen: (lead: LeadCard) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });
  return (
    <div
      ref={setNodeRef}
      className={`leadCard ${isDragging ? "ghost" : ""}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-label={`${lead.name}. Press Enter to open, Space to move.`}
      onClick={() => onOpen(lead)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isDragging) onOpen(lead);
        else listeners?.onKeyDown?.(e);
      }}
    >
      <CardBody lead={lead} />
    </div>
  );
}

function Column({ status, ids, byId, onOpen }: { status: (typeof STATUSES)[number]; ids: string[]; byId: Record<string, LeadCard>; onOpen: (lead: LeadCard) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id });
  const due = status.id === "advance_paid" || status.id === "balance_pending"
    ? ids.reduce((sum, id) => sum + Math.max((byId[id].price ?? 0) - byId[id].amountPaid, 0), 0)
    : null;
  return (
    <section className={`column ${isOver ? "over" : ""}`} id={status.id} aria-label={status.label}>
      <div className="columnHead">
        <i className="dot" style={{ background: status.color }} />
        {status.label}
        <em>{ids.length}</em>
      </div>
      {due != null && <div className="columnTotal">{formatINR(due)} outstanding</div>}
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="columnBody">
          {ids.map((id) => <SortableCard key={id} lead={byId[id]} onOpen={onOpen} />)}
          {ids.length === 0 && <p className="empty" style={{ padding: "18px 8px" }}>Drop here</p>}
        </div>
      </SortableContext>
    </section>
  );
}

export default function Board({ initial }: { initial: LeadCard[] }) {
  const [byId, setById] = useState(() => Object.fromEntries(initial.map((c) => [c.id, c])));
  const [cols, setCols] = useState(() => group(initial));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | "content_day" | "ugc">("all");
  const [toast, setToast] = useState("");
  const snapshot = useRef<{ cols: Columns; byId: Record<string, LeadCard> } | null>(null);
  const lastDragEnd = useRef(0);
  const openLead = useOpenLead();

  // Fresh server data (e.g. after editing in the drawer) replaces local state.
  useEffect(() => {
    if (activeId) return;
    setById(Object.fromEntries(initial.map((c) => [c.id, c])));
    setCols(group(initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  useEffect(() => {
    initial.forEach((c) => leadCache.set(c.id, c));
  }, [initial]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space", "Enter"] },
    })
  );

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => {
    const match = (c: LeadCard) =>
      (kind === "all" || c.kind === kind) &&
      (!q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.business ?? "").toLowerCase().includes(q));
    return Object.fromEntries(STATUSES.map((s) => [s.id, cols[s.id].filter((id) => byId[id] && match(byId[id]))])) as Columns;
  }, [cols, byId, q, kind]);

  const findCol = (id: string): StatusId | undefined =>
    (STATUSES.find((s) => s.id === id)?.id) ?? STATUSES.find((s) => cols[s.id].includes(id))?.id;

  function onDragStart({ active }: DragStartEvent) {
    snapshot.current = { cols, byId };
    setActiveId(String(active.id));
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const from = findCol(String(active.id));
    const to = findCol(String(over.id));
    if (!from || !to || from === to) return;
    setCols((prev) => {
      const fromIds = prev[from].filter((id) => id !== active.id);
      const toIds = [...prev[to]];
      const overIndex = toIds.indexOf(String(over.id));
      toIds.splice(overIndex >= 0 ? overIndex : toIds.length, 0, String(active.id));
      return { ...prev, [from]: fromIds, [to]: toIds };
    });
  }

  function onDragCancel() {
    if (snapshot.current) setCols(snapshot.current.cols);
    setActiveId(null);
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    const id = String(active.id);
    setActiveId(null);
    lastDragEnd.current = Date.now();
    const before = snapshot.current;
    if (!over || !before) return onDragCancel();

    const col = findCol(id)!;
    let ids = cols[col];
    const overIndex = ids.indexOf(String(over.id));
    const currentIndex = ids.indexOf(id);
    if (overIndex >= 0 && overIndex !== currentIndex) ids = arrayMove(ids, currentIndex, overIndex);

    const index = ids.indexOf(id);
    const position = positionBetween(byId[ids[index - 1]]?.position, byId[ids[index + 1]]?.position);
    const original = before.byId[id];
    if (original.status === col && before.cols[col].indexOf(id) === index) {
      setCols(before.cols);
      return;
    }

    const updated = { ...original, status: col, position };
    setCols({ ...cols, [col]: ids });
    setById((prev) => ({ ...prev, [id]: updated }));
    leadCache.set(id, updated);

    moveBooking(id, col, position)
      .then((res) => {
        if (!res.ok) throw new Error(res.error);
      })
      .catch((error: Error) => {
        setCols(before.cols);
        setById(before.byId);
        leadCache.set(id, original);
        setToast(`Couldn't move ${original.name}: ${error.message || "network error"}. Change undone.`);
      });
  }

  const open = (lead: LeadCard) => {
    if (Date.now() - lastDragEnd.current < 150) return;
    openLead(byId[lead.id] ?? lead);
  };

  return (
    <>
      <div className="pageHead">
        <div>
          <h1>Board</h1>
          <p>Drag leads between stages. Changes save automatically.</p>
        </div>
        <div className="boardTools">
          <label style={{ position: "relative", display: "flex", flex: "1 1 200px" }}>
            <Search size={15} style={{ position: "absolute", left: 11, top: 11, color: "var(--muted)" }} />
            <input className="input" style={{ paddingLeft: 32 }} placeholder="Search name, phone, business" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search leads" />
          </label>
          <div className="segmented" role="group" aria-label="Filter by type">
            {([["all", "All"], ["content_day", "Content day"], ["ugc", "UGC"]] as const).map(([value, label]) => (
              <button key={value} className={kind === value ? "on" : ""} onClick={() => setKind(value)} aria-pressed={kind === value}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
        <div className="board">
          {STATUSES.map((s) => <Column key={s.id} status={s} ids={visible[s.id]} byId={byId} onOpen={open} />)}
        </div>
        <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }}>
          {activeId && byId[activeId] ? <div className="leadCard overlay"><CardBody lead={byId[activeId]} /></div> : null}
        </DragOverlay>
      </DndContext>

      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
