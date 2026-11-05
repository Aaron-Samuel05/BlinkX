import { beforeAll, describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import { addDays, slotLabel, slotsBlockedByBusy, slotSortKey, slotTiming, todayInIndia } from "../lib/slots";
import { positionBetween } from "../lib/positions";
import { decrypt, encrypt } from "../lib/crypto";

describe("slotTiming", () => {
  it("maps content slots to India-time windows", () => {
    expect(slotTiming("content_day", "2026-11-05", "Morning (9 AM to 12 PM)")).toEqual({
      allDay: false, start: "2026-11-05T09:00:00+05:30", end: "2026-11-05T12:00:00+05:30",
    });
    expect(slotTiming("content_day", "2026-11-05", "Evening (4 PM to 7 PM)")).toMatchObject({ end: "2026-11-05T19:00:00+05:30" });
  });
  it("makes Discuss on call an all-day event", () => {
    expect(slotTiming("content_day", "2026-11-05", "Discuss on call")).toEqual({ allDay: true, date: "2026-11-05" });
  });
  it("gives UGC times a 30-minute event, including across the hour", () => {
    expect(slotTiming("ugc", "2026-11-05", "13:30")).toEqual({
      allDay: false, start: "2026-11-05T13:30:00+05:30", end: "2026-11-05T14:00:00+05:30",
    });
  });
});

describe("slotsBlockedByBusy", () => {
  it("blocks only overlapping windows and never Discuss on call", () => {
    const busy = [{ start: "2026-11-05T06:30:00Z", end: "2026-11-05T07:00:00Z" }]; // 12:00–12:30 IST
    expect(slotsBlockedByBusy("2026-11-05", busy)).toEqual(["Afternoon (12 PM to 4 PM)"]);
  });
  it("treats touching edges as free", () => {
    const busy = [{ start: "2026-11-05T08:00:00+05:30", end: "2026-11-05T09:00:00+05:30" }];
    expect(slotsBlockedByBusy("2026-11-05", busy)).toEqual([]);
  });
});

describe("date and label helpers", () => {
  it("computes India today across the UTC date line", () => {
    expect(todayInIndia(new Date("2026-11-04T19:00:00Z"))).toBe("2026-11-05");
  });
  it("adds days across month ends", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
  });
  it("labels and sorts slots", () => {
    expect(slotLabel("13:30")).toBe("1:30 PM");
    expect(slotLabel("Discuss on call")).toBe("Flexible");
    expect(slotSortKey("Morning (9 AM to 12 PM)") < slotSortKey("10:00")).toBe(true);
  });
});

describe("positionBetween", () => {
  it("handles empty, top, bottom and middle", () => {
    expect(positionBetween(undefined, undefined)).toBe(1024);
    expect(positionBetween(undefined, 1024)).toBe(0);
    expect(positionBetween(1024, undefined)).toBe(2048);
    expect(positionBetween(1024, 2048)).toBe(1536);
  });
});

describe("encrypt/decrypt", () => {
  beforeAll(() => { process.env.ENCRYPTION_KEY = randomBytes(32).toString("base64"); });
  it("round-trips and rejects tampering", () => {
    const enc = encrypt("1//refresh-token");
    expect(enc).not.toContain("refresh");
    expect(decrypt(enc)).toBe("1//refresh-token");
    const [iv, tag, data] = enc.split(".");
    expect(() => decrypt([iv, tag, Buffer.from("x" + data).toString("base64")].join("."))).toThrow();
  });
});
