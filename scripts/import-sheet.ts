// One-time import of old bookings from the Google Sheet.
// 1. In Google Sheets: File → Download → Comma-separated values (.csv)
// 2. npm run import-sheet -- path/to/bookings.csv            (dry run: shows what would be imported)
//    npm run import-sheet -- path/to/bookings.csv --commit   (writes to the database)
import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync } from "node:fs";

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

// Header aliases, matched case-insensitively.
const COLUMNS: Record<string, string[]> = {
  date: ["date", "booking date", "preferred date", "shoot date"],
  time: ["time", "call time", "preferred time", "slot", "time slot"],
  name: ["name", "full name", "your name"],
  phone: ["phone", "phone number", "mobile", "whatsapp"],
  email: ["email", "email address"],
  business: ["business", "brand", "business / brand", "company"],
  type: ["type", "client type", "category"],
  location: ["location", "shoot location", "area"],
  package: ["package", "plan"],
  createdAt: ["timestamp", "created", "created at", "submitted at"],
};

const PACKAGES = [
  { id: "starter", match: /starter|\b8 reels/i, name: "Starter", reels: 8, price: 10000, advance: 5000 },
  { id: "growth", match: /growth|\b12 reels/i, name: "Growth", reels: 12, price: 15000, advance: 7500 },
  { id: "scale", match: /scale|\b18 reels/i, name: "Scale", reels: 18, price: 25000, advance: 12500 },
];

function toIsoDate(value: string) {
  const v = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const dmy = v.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/); // Sheets in India export DD/MM/YYYY
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  const parsed = new Date(v);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

async function main() {
  const [file, flag] = process.argv.slice(2);
  if (!file) throw new Error("Usage: npm run import-sheet -- <file.csv> [--commit]");
  const [header, ...data] = parseCsv(readFileSync(file, "utf8"));
  const norm = header.map((h) => h.trim().toLowerCase());
  const col = Object.fromEntries(Object.entries(COLUMNS).map(([key, aliases]) => [key, norm.findIndex((h) => aliases.includes(h))]));
  console.log("Column mapping:", Object.fromEntries(Object.entries(col).map(([k, i]) => [k, i >= 0 ? header[i] : "(not found)"])));
  for (const required of ["date", "name", "phone"]) {
    if (col[required] < 0) throw new Error(`Couldn't find a "${required}" column. Headers: ${header.join(", ")}`);
  }

  const get = (row: string[], key: string) => (col[key] >= 0 ? (row[col[key]] ?? "").trim() : "");
  const rows = [];
  const skipped: string[] = [];
  for (const [i, row] of data.entries()) {
    const date = toIsoDate(get(row, "date"));
    const name = get(row, "name");
    const phone = get(row, "phone");
    if (!date || !name || !phone) { skipped.push(`row ${i + 2}: missing date/name/phone`); continue; }
    const packageText = get(row, "package");
    const isUgc = /ugc/i.test(packageText) || /ugc/i.test(get(row, "type"));
    const pkg = PACKAGES.find((p) => p.match.test(packageText));
    const createdAt = get(row, "createdAt") ? new Date(get(row, "createdAt")) : null;
    rows.push({
      kind: isUgc ? ("ugc" as const) : ("content_day" as const),
      name, phone,
      email: get(row, "email") || null,
      business: get(row, "business") || null,
      clientType: get(row, "type") || null,
      location: get(row, "location") || null,
      packageId: pkg?.id ?? null,
      packageLabel: isUgc ? "UGC Content" : pkg ? `${pkg.name} · ${pkg.reels} Reels` : packageText || null,
      price: isUgc ? null : pkg?.price ?? null,
      advance: isUgc ? null : pkg?.advance ?? null,
      scheduledDate: date,
      timeSlot: get(row, "time") || "Discuss on call",
      source: "sheet_import",
      status: "scheduled" as const,
      position: -(createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.getTime() : Date.parse(date)) / 1000,
      ...(createdAt && !Number.isNaN(createdAt.getTime()) ? { createdAt } : {}),
    });
  }

  console.log(`\n${rows.length} bookings ready, ${skipped.length} skipped.`);
  skipped.slice(0, 20).forEach((s) => console.log("  skipped", s));
  console.table(rows.slice(0, 5).map((r) => ({ date: r.scheduledDate, time: r.timeSlot, name: r.name, plan: r.packageLabel })));

  if (flag !== "--commit") {
    console.log("\nDry run only. Re-run with --commit to import.");
    return;
  }
  const { db, schema } = await import("../lib/db");
  let inserted = 0;
  for (const r of rows) {
    // Duplicate content-day slots (already imported, or double-booked in the Sheet) are skipped.
    const result = await db.insert(schema.bookings).values(r).onConflictDoNothing().returning({ id: schema.bookings.id });
    if (result[0]) {
      inserted++;
      await db.insert(schema.bookingEvents).values({ bookingId: result[0].id, toStatus: "scheduled" });
    }
  }
  console.log(`Imported ${inserted} of ${rows.length}. Imported leads start in "Scheduled"; move them on the board as needed.`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
