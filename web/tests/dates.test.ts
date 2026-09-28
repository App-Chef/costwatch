import { describe, expect, it } from "vitest";
import { addDays, addMonths, daysBetween, isISODate, lastMonths, monthEnd, todayIn } from "@/lib/dates";

describe("dates", () => {
  it("validates ISO dates strictly", () => {
    expect(isISODate("2026-02-28")).toBe(true);
    expect(isISODate("2026-02-30")).toBe(false);
    expect(isISODate("2028-02-29")).toBe(true);
    expect(isISODate("26-02-01")).toBe(false);
    expect(isISODate("")).toBe(false);
  });

  it("adds months and clamps to month end", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2028-01-31", 1)).toBe("2028-02-29");
    expect(addMonths("2026-01-31", 2)).toBe("2026-03-31");
    expect(addMonths("2026-11-15", 3)).toBe("2027-02-15");
    expect(addMonths("2026-03-31", -1)).toBe("2026-02-28");
  });

  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("counts days between dates", () => {
    expect(daysBetween("2026-09-28", "2026-10-04")).toBe(6);
    expect(daysBetween("2026-10-04", "2026-09-28")).toBe(-6);
    // DST changes don't matter because everything is UTC.
    expect(daysBetween("2026-03-01", "2026-04-01")).toBe(31);
  });

  it("lists the last N months, oldest first", () => {
    expect(lastMonths("2026-02-15", 3)).toEqual(["2025-12", "2026-01", "2026-02"]);
    expect(monthEnd("2026-02-10")).toBe("2026-02-28");
  });

  it("falls back to UTC for unknown timezones", () => {
    expect(todayIn("Not/AZone")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(todayIn("Africa/Kigali")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
