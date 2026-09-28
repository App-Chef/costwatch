// All of Costwatch's money math lives here as pure functions so it can be
// unit-tested and reasoned about in one place. See docs/calculations.md.
//
// Rules that apply everywhere:
// - Only amounts in the product's currency are added up. Anything in another
//   currency is reported separately; money is never silently converted.
// - "Monthly cost" means the estimated monthly equivalent of *active*
//   recurring costs. One-time costs are reported on their own.

import { addDays, addMonths, daysBetween, monthEnd, monthKey, monthsBetween } from "./dates";
import { sumMoney } from "./money";
import type { BillingCycle, CostStatus, IntervalUnit } from "@/types/database";

export type Billing = {
  amount: number;
  billing_cycle: BillingCycle;
  custom_interval_count: number | null;
  custom_interval_unit: IntervalUnit | null;
};

export type CostLike = Billing & {
  id: string;
  name: string;
  currency: string;
  category: string;
  status: CostStatus;
  start_date: string | null;
  next_renewal: string | null;
  created_at: string;
};

export type HistoryLike = Billing & {
  cost_id: string;
  currency: string;
  status: CostStatus;
  recorded_at: string;
};

export type RevenueLike = { amount: number; currency: string; date: string };

// Average month lengths, so "every 30 days" isn't treated as exactly monthly.
const MONTHS_PER_UNIT: Record<IntervalUnit, number> = {
  day: 12 / 365.25,
  week: (12 * 7) / 365.25,
  month: 1,
  year: 12,
};

export type Interval = { count: number; unit: IntervalUnit };

export function billingInterval(b: Omit<Billing, "amount">): Interval | null {
  switch (b.billing_cycle) {
    case "monthly":
      return { count: 1, unit: "month" };
    case "quarterly":
      return { count: 3, unit: "month" };
    case "yearly":
      return { count: 1, unit: "year" };
    case "custom":
      if (!b.custom_interval_count || !b.custom_interval_unit || b.custom_interval_count < 1) return null;
      return { count: b.custom_interval_count, unit: b.custom_interval_unit };
    case "one_time":
      return null;
  }
}

/**
 * Estimated monthly equivalent of a recurring charge.
 * yearly / 12, quarterly / 3, custom by its interval. Null for one-time costs.
 */
export function monthlyEquivalent(b: Billing): number | null {
  const interval = billingInterval(b);
  if (!interval) return null;
  return b.amount / (interval.count * MONTHS_PER_UNIT[interval.unit]);
}

export type CurrencyTotal = { currency: string; monthly: number; count: number };

export type CostSummary = {
  /** Estimated monthly total of active recurring costs in the product currency. */
  monthlyTotal: number;
  activeRecurringCount: number;
  byCategory: { category: string; monthly: number; count: number }[];
  /** Active recurring costs in other currencies, not included in the total. */
  excluded: CurrencyTotal[];
};

export function summarizeCosts(costs: CostLike[], productCurrency: string): CostSummary {
  const included: { category: string; monthly: number }[] = [];
  const excluded = new Map<string, CurrencyTotal>();

  for (const cost of costs) {
    if (cost.status !== "active") continue;
    const monthly = monthlyEquivalent(cost);
    if (monthly === null) continue;
    if (cost.currency === productCurrency) {
      included.push({ category: cost.category, monthly });
    } else {
      const e = excluded.get(cost.currency) ?? { currency: cost.currency, monthly: 0, count: 0 };
      e.monthly += monthly;
      e.count += 1;
      excluded.set(cost.currency, e);
    }
  }

  const categories = new Map<string, { category: string; monthly: number; count: number }>();
  for (const c of included) {
    const entry = categories.get(c.category) ?? { category: c.category, monthly: 0, count: 0 };
    entry.monthly += c.monthly;
    entry.count += 1;
    categories.set(c.category, entry);
  }

  return {
    monthlyTotal: included.reduce((acc, c) => acc + c.monthly, 0),
    activeRecurringCount: included.length,
    byCategory: [...categories.values()].sort((a, b) => b.monthly - a.monthly),
    excluded: [...excluded.values()].sort((a, b) => a.currency.localeCompare(b.currency)),
  };
}

export type Profit = {
  profit: number;
  /** Null when there is no revenue: a margin is meaningless then. */
  margin: number | null;
};

export function calculateProfit(revenue: number, costs: number): Profit {
  const profit = revenue - costs;
  return { profit, margin: revenue > 0 ? (profit / revenue) * 100 : null };
}

export type RevenueTotals = { total: number; count: number; excluded: CurrencyTotal[] };

/** Revenue in `productCurrency` whose date falls in month `key` ("YYYY-MM"). */
export function revenueForMonth(entries: RevenueLike[], productCurrency: string, key: string): RevenueTotals {
  const inMonth = entries.filter((r) => monthKey(r.date) === key);
  const included = inMonth.filter((r) => r.currency === productCurrency);
  const excluded = new Map<string, CurrencyTotal>();
  for (const r of inMonth) {
    if (r.currency === productCurrency) continue;
    const e = excluded.get(r.currency) ?? { currency: r.currency, monthly: 0, count: 0 };
    e.monthly = sumMoney([e.monthly, r.amount]);
    e.count += 1;
    excluded.set(r.currency, e);
  }
  return {
    total: sumMoney(included.map((r) => r.amount)),
    count: included.length,
    excluded: [...excluded.values()],
  };
}

/** One-time costs in the product currency dated (by start date) within month `key`. */
export function oneTimeCostsForMonth(costs: CostLike[], productCurrency: string, key: string): number {
  return sumMoney(
    costs
      .filter(
        (c) =>
          c.billing_cycle === "one_time" &&
          c.status !== "inactive" &&
          c.currency === productCurrency &&
          monthKey(c.start_date ?? c.created_at.slice(0, 10)) === key,
      )
      .map((c) => c.amount),
  );
}

// ---------------------------------------------------------------------------
// Renewals
// ---------------------------------------------------------------------------

function addInterval(iso: string, interval: Interval, times: number): string {
  switch (interval.unit) {
    case "day":
      return addDays(iso, interval.count * times);
    case "week":
      return addDays(iso, interval.count * 7 * times);
    case "month":
      return addMonths(iso, interval.count * times);
    case "year":
      return addMonths(iso, interval.count * 12 * times);
  }
}

export type Renewal = {
  date: string;
  daysUntil: number;
  /** True when the stored renewal date had passed and this one was projected from it. */
  projected: boolean;
};

/**
 * The next renewal on or after `today`. If the saved renewal date is in the
 * past, it is rolled forward by the billing interval, always counting from the
 * original anchor date so month-end dates don't drift (Jan 31 → Feb 28 → Mar 31).
 */
export function nextRenewal(cost: Pick<CostLike, "billing_cycle" | "custom_interval_count" | "custom_interval_unit" | "next_renewal" | "status">, today: string): Renewal | null {
  if (cost.status !== "active" || !cost.next_renewal) return null;
  const interval = billingInterval(cost);
  if (!interval) return null;

  const anchor = cost.next_renewal;
  if (anchor >= today) return { date: anchor, daysUntil: daysBetween(today, anchor), projected: false };

  // Jump close to today, then step forward.
  let k: number;
  if (interval.unit === "day" || interval.unit === "week") {
    const step = interval.count * (interval.unit === "week" ? 7 : 1);
    k = Math.max(1, Math.floor(daysBetween(anchor, today) / step));
  } else {
    const step = interval.count * (interval.unit === "year" ? 12 : 1);
    k = Math.max(1, Math.floor(monthsBetween(anchor, today) / step));
  }
  let date = addInterval(anchor, interval, k);
  while (date < today) {
    k += 1;
    date = addInterval(anchor, interval, k);
  }
  return { date, daysUntil: daysBetween(today, date), projected: true };
}

export type UpcomingRenewal<T> = { cost: T; renewal: Renewal };

/** Active recurring costs renewing within `withinDays` of today (all when null), soonest first. */
export function upcomingRenewals<T extends CostLike>(costs: T[], today: string, withinDays: number | null): UpcomingRenewal<T>[] {
  return costs
    .map((cost) => ({ cost, renewal: nextRenewal(cost, today) }))
    .filter((r): r is UpcomingRenewal<T> => r.renewal !== null && (withinDays === null || r.renewal.daysUntil <= withinDays))
    .sort((a, b) => a.renewal.daysUntil - b.renewal.daysUntil || a.cost.name.localeCompare(b.cost.name));
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

function snapshotAt(history: HistoryLike[], date: string): HistoryLike | undefined {
  // `history` is sorted oldest first.
  let found: HistoryLike | undefined;
  for (const h of history) {
    if (h.recorded_at.slice(0, 10) <= date) found = h;
    else break;
  }
  return found;
}

function groupHistory(history: HistoryLike[]): Map<string, HistoryLike[]> {
  const byCost = new Map<string, HistoryLike[]>();
  for (const h of [...history].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))) {
    const list = byCost.get(h.cost_id) ?? [];
    list.push(h);
    byCost.set(h.cost_id, list);
  }
  return byCost;
}

/**
 * Estimated recurring monthly cost for each month in `months` ("YYYY-MM"),
 * reconstructed from cost history:
 * - a cost counts from the month of its start date (or creation);
 * - its price and status are the last snapshot recorded on or before the end
 *   of that month (or before today, for the current month);
 * - months after the start date but before the first snapshot use the first
 *   snapshot, since Costwatch has no earlier information.
 */
export function monthlyCostSeries(
  costs: CostLike[],
  history: HistoryLike[],
  productCurrency: string,
  months: string[],
  today: string,
): number[] {
  const byCost = groupHistory(history);

  return months.map((key) => {
    const end = monthEnd(`${key}-01`);
    const cutoff = end < today ? end : today;
    let total = 0;
    for (const cost of costs) {
      const started = cost.start_date ?? cost.created_at.slice(0, 10);
      if (started > cutoff) continue;
      const snaps = byCost.get(cost.id);
      const snap: Billing & { status: CostStatus; currency: string } =
        (snaps && (snapshotAt(snaps, cutoff) ?? snaps[0])) ?? cost;
      if (snap.status !== "active" || snap.currency !== productCurrency) continue;
      total += monthlyEquivalent(snap) ?? 0;
    }
    return total;
  });
}

export type CostTrend = { from: number; to: number; since: string };

/**
 * How a cost's monthly equivalent changed since its first recorded price.
 * Null when there's no change (or no comparable history).
 */
export function costTrend(cost: CostLike, history: HistoryLike[]): CostTrend | null {
  const snaps = history
    .filter((h) => h.cost_id === cost.id && h.currency === cost.currency && h.status === "active")
    .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
  const current = monthlyEquivalent(cost);
  if (snaps.length === 0 || current === null) return null;
  const first = snaps[0];
  const from = monthlyEquivalent(first);
  if (from === null || Math.abs(from - current) < 0.005) return null;
  return { from, to: current, since: first.recorded_at.slice(0, 10) };
}

export type CostChange = {
  costId: string;
  name: string;
  from: number;
  to: number;
  currency: string;
  date: string;
};

/** Price changes (monthly equivalent) recorded on or after `since`, newest first. */
export function recentCostChanges(costs: CostLike[], history: HistoryLike[], since: string): CostChange[] {
  const names = new Map(costs.map((c) => [c.id, c.name]));
  const changes: CostChange[] = [];
  for (const [costId, snaps] of groupHistory(history)) {
    for (let i = 1; i < snaps.length; i++) {
      const prev = snaps[i - 1];
      const next = snaps[i];
      if (next.recorded_at.slice(0, 10) < since || next.currency !== prev.currency) continue;
      const from = monthlyEquivalent(prev);
      const to = monthlyEquivalent(next);
      if (from === null || to === null || Math.abs(from - to) < 0.005) continue;
      changes.push({ costId, name: names.get(costId) ?? "Deleted cost", from, to, currency: next.currency, date: next.recorded_at.slice(0, 10) });
    }
  }
  return changes.sort((a, b) => b.date.localeCompare(a.date));
}
