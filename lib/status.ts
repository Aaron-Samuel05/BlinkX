// Pipeline stages, shared by server and client code.
export const STATUSES = [
  { id: "scheduled", label: "Scheduled", color: "#4f6bed", soft: "#eef1fd" },
  { id: "advance_paid", label: "Advance paid", color: "#d98a00", soft: "#fff5e0" },
  { id: "balance_pending", label: "Balance pending", color: "#e0561b", soft: "#fdede5" },
  { id: "paid", label: "Paid", color: "#1f9d55", soft: "#e7f6ed" },
  { id: "closed", label: "Closed", color: "#6b6b68", soft: "#f0efec" },
] as const;

export type StatusId = (typeof STATUSES)[number]["id"];
export const STATUS_IDS = STATUSES.map((s) => s.id) as StatusId[];
export const statusMeta = (id: string) => STATUSES.find((s) => s.id === id) ?? STATUSES[0];

export function formatINR(value: number | null | undefined) {
  return value == null ? "—" : `₹${value.toLocaleString("en-IN")}`;
}

export function formatDate(date: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Date(`${date}T12:00:00+05:30`).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", ...opts });
}

/** Lean card shape sent to client components. */
export type LeadCard = {
  id: string;
  kind: "content_day" | "ugc";
  name: string;
  phone: string;
  business: string | null;
  packageLabel: string | null;
  price: number | null;
  advance: number | null;
  amountPaid: number;
  scheduledDate: string;
  timeSlot: string;
  status: StatusId;
  position: number;
  nextFollowUp: string | null;
  syncError: string | null;
};
