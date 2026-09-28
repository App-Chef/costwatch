// Calendar-date helpers. Costwatch stores plain dates ("YYYY-MM-DD") and does
// all arithmetic in UTC so results never shift with the server's timezone.

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

export function isISODate(value: string): boolean {
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

function toUTC(iso: string): Date {
  const m = ISO_DATE.exec(iso);
  if (!m) throw new Error(`Invalid date: ${iso}`);
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
}

function fromUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  return fromUTC(new Date(toUTC(iso).getTime() + days * DAY_MS));
}

/** Adds calendar months, clamping to the end of shorter months (Jan 31 + 1 → Feb 28). */
export function addMonths(iso: string, months: number): string {
  const d = toUTC(iso);
  const day = d.getUTCDate();
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return fromUTC(target);
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUTC(to).getTime() - toUTC(from).getTime()) / DAY_MS);
}

export function monthsBetween(from: string, to: string): number {
  const a = toUTC(from);
  const b = toUTC(to);
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
}

/** Today's date in the given IANA timezone (falls back to UTC). */
export function todayIn(timeZone?: string): string {
  const now = new Date();
  if (timeZone) {
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now);
    } catch {
      // Unknown timezone: fall through to UTC.
    }
  }
  return fromUTC(now);
}

/** "YYYY-MM" */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function monthStart(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function monthEnd(iso: string): string {
  return addDays(addMonths(monthStart(iso), 1), -1);
}

/** The `count` month keys ending with the month of `today`, oldest first. */
export function lastMonths(today: string, count: number): string[] {
  const start = monthStart(today);
  return Array.from({ length: count }, (_, i) => monthKey(addMonths(start, i - count + 1)));
}

export function formatDate(iso: string, style: "short" | "medium" | "long" = "medium"): string {
  const options: Intl.DateTimeFormatOptions =
    style === "short"
      ? { month: "short", day: "2-digit", timeZone: "UTC" }
      : style === "medium"
        ? { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }
        : { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" };
  return new Intl.DateTimeFormat("en-US", options).format(toUTC(iso));
}

/** "September 2026" or "Sep" for a "YYYY-MM" key. */
export function formatMonth(key: string, style: "long" | "short" = "long"): string {
  const d = toUTC(`${key}-01`);
  return new Intl.DateTimeFormat(
    "en-US",
    style === "long"
      ? { month: "long", year: "numeric", timeZone: "UTC" }
      : { month: "short", timeZone: "UTC" },
  ).format(d);
}

export function relativeDays(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${-days} days ago`;
  return `In ${days} days`;
}
