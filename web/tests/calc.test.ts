import { describe, expect, it } from "vitest";
import {
  calculateProfit,
  costTrend,
  monthlyCostSeries,
  monthlyEquivalent,
  nextRenewal,
  oneTimeCostsForMonth,
  recentCostChanges,
  revenueForMonth,
  summarizeCosts,
  upcomingRenewals,
  type CostLike,
  type HistoryLike,
} from "@/lib/calc";

let seq = 0;
function cost(overrides: Partial<CostLike> = {}): CostLike {
  seq += 1;
  return {
    id: `c${seq}`,
    name: `Cost ${seq}`,
    amount: 10,
    currency: "USD",
    billing_cycle: "monthly",
    custom_interval_count: null,
    custom_interval_unit: null,
    category: "hosting",
    status: "active",
    start_date: "2026-01-01",
    next_renewal: null,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function snap(c: CostLike, at: string, overrides: Partial<HistoryLike> = {}): HistoryLike {
  return {
    cost_id: c.id,
    amount: c.amount,
    currency: c.currency,
    billing_cycle: c.billing_cycle,
    custom_interval_count: c.custom_interval_count,
    custom_interval_unit: c.custom_interval_unit,
    status: c.status,
    recorded_at: `${at}T12:00:00Z`,
    ...overrides,
  };
}

describe("monthlyEquivalent", () => {
  const base = { custom_interval_count: null, custom_interval_unit: null } as const;

  it("converts each billing cycle to a monthly estimate", () => {
    expect(monthlyEquivalent({ ...base, amount: 20, billing_cycle: "monthly" })).toBe(20);
    expect(monthlyEquivalent({ ...base, amount: 120, billing_cycle: "yearly" })).toBe(10);
    expect(monthlyEquivalent({ ...base, amount: 30, billing_cycle: "quarterly" })).toBe(10);
  });

  it("returns null for one-time costs", () => {
    expect(monthlyEquivalent({ ...base, amount: 300, billing_cycle: "one_time" })).toBeNull();
  });

  it("handles custom intervals", () => {
    expect(monthlyEquivalent({ amount: 60, billing_cycle: "custom", custom_interval_count: 6, custom_interval_unit: "month" })).toBe(10);
    expect(monthlyEquivalent({ amount: 240, billing_cycle: "custom", custom_interval_count: 2, custom_interval_unit: "year" })).toBe(10);
    // 365.25 days per year → a 30-day charge is slightly more than monthly.
    expect(monthlyEquivalent({ amount: 30, billing_cycle: "custom", custom_interval_count: 30, custom_interval_unit: "day" })).toBeCloseTo(30.4375, 4);
    expect(monthlyEquivalent({ amount: 7, billing_cycle: "custom", custom_interval_count: 1, custom_interval_unit: "week" })).toBeCloseTo(30.4375, 4);
  });

  it("returns null for an incomplete custom interval", () => {
    expect(monthlyEquivalent({ amount: 10, billing_cycle: "custom", custom_interval_count: null, custom_interval_unit: "month" })).toBeNull();
  });
});

describe("summarizeCosts", () => {
  it("adds active recurring costs in the product currency", () => {
    const s = summarizeCosts(
      [
        cost({ amount: 20, category: "hosting" }),
        cost({ amount: 25, category: "database" }),
        cost({ amount: 12, billing_cycle: "yearly", category: "domain" }),
        cost({ amount: 30, billing_cycle: "quarterly", category: "hosting" }),
      ],
      "USD",
    );
    expect(s.monthlyTotal).toBeCloseTo(20 + 25 + 1 + 10, 10);
    expect(s.activeRecurringCount).toBe(4);
    expect(s.byCategory.map((c) => c.category)).toEqual(["hosting", "database", "domain"]);
    expect(s.byCategory[0].monthly).toBe(30);
  });

  it("ignores paused, inactive and one-time costs", () => {
    const s = summarizeCosts(
      [
        cost({ amount: 20 }),
        cost({ amount: 50, status: "paused" }),
        cost({ amount: 50, status: "inactive" }),
        cost({ amount: 500, billing_cycle: "one_time" }),
      ],
      "USD",
    );
    expect(s.monthlyTotal).toBe(20);
  });

  it("never converts currencies: other currencies are reported separately", () => {
    const s = summarizeCosts([cost({ amount: 20 }), cost({ amount: 5, currency: "EUR" }), cost({ amount: 60, currency: "EUR", billing_cycle: "yearly" })], "USD");
    expect(s.monthlyTotal).toBe(20);
    expect(s.excluded).toEqual([{ currency: "EUR", monthly: 10, count: 2 }]);
  });

  it("is zero with no costs", () => {
    expect(summarizeCosts([], "USD")).toEqual({ monthlyTotal: 0, activeRecurringCount: 0, byCategory: [], excluded: [] });
  });
});

describe("calculateProfit", () => {
  it("subtracts monthly costs from revenue", () => {
    const p = calculateProfit(1240, 184);
    expect(p.profit).toBe(1056);
    expect(p.margin).toBeCloseTo(85.16, 2);
  });

  it("handles losses", () => {
    const p = calculateProfit(100, 150);
    expect(p.profit).toBe(-50);
    expect(p.margin).toBe(-50);
  });

  it("does not divide by zero when there is no revenue", () => {
    const p = calculateProfit(0, 91);
    expect(p.profit).toBe(-91);
    expect(p.margin).toBeNull();
  });
});

describe("revenueForMonth", () => {
  const entries = [
    { amount: 900.1, currency: "USD", date: "2026-09-02" },
    { amount: 339.9, currency: "USD", date: "2026-09-14" },
    { amount: 100, currency: "USD", date: "2026-08-30" },
    { amount: 50, currency: "EUR", date: "2026-09-20" },
  ];

  it("sums entries of the month without float drift", () => {
    const r = revenueForMonth(entries, "USD", "2026-09");
    expect(r.total).toBe(1240);
    expect(r.count).toBe(2);
    expect(r.excluded).toEqual([{ currency: "EUR", monthly: 50, count: 1 }]);
  });
});

describe("oneTimeCostsForMonth", () => {
  it("counts one-time costs by the month they were paid", () => {
    const costs = [
      cost({ billing_cycle: "one_time", amount: 150, start_date: "2026-09-03" }),
      cost({ billing_cycle: "one_time", amount: 99, start_date: "2026-08-03" }),
      cost({ billing_cycle: "monthly", amount: 20, start_date: "2026-09-03" }),
    ];
    expect(oneTimeCostsForMonth(costs, "USD", "2026-09")).toBe(150);
  });
});

describe("nextRenewal", () => {
  const today = "2026-09-28";

  it("returns the saved date when it is today or later", () => {
    expect(nextRenewal(cost({ next_renewal: "2026-10-04" }), today)).toEqual({ date: "2026-10-04", daysUntil: 6, projected: false });
    expect(nextRenewal(cost({ next_renewal: today }), today)?.daysUntil).toBe(0);
  });

  it("rolls a past monthly renewal forward", () => {
    expect(nextRenewal(cost({ next_renewal: "2026-06-04" }), today)).toEqual({ date: "2026-10-04", daysUntil: 6, projected: true });
    expect(nextRenewal(cost({ next_renewal: "2026-09-27" }), today)?.date).toBe("2026-10-27");
  });

  it("keeps month-end anchors from drifting", () => {
    expect(nextRenewal(cost({ next_renewal: "2026-01-31" }), "2026-03-01")?.date).toBe("2026-03-31");
    expect(nextRenewal(cost({ next_renewal: "2026-01-31" }), "2026-02-15")?.date).toBe("2026-02-28");
  });

  it("rolls yearly, quarterly and custom cycles", () => {
    expect(nextRenewal(cost({ billing_cycle: "yearly", next_renewal: "2024-11-02" }), today)?.date).toBe("2026-11-02");
    expect(nextRenewal(cost({ billing_cycle: "quarterly", next_renewal: "2026-01-15" }), today)?.date).toBe("2026-10-15");
    expect(
      nextRenewal(cost({ billing_cycle: "custom", custom_interval_count: 2, custom_interval_unit: "week", next_renewal: "2026-09-01" }), today)?.date,
    ).toBe("2026-09-29");
    expect(
      nextRenewal(cost({ billing_cycle: "custom", custom_interval_count: 45, custom_interval_unit: "day", next_renewal: "2025-01-01" }), today)?.date,
    ).toBe("2026-11-07");
  });

  it("has no renewal for one-time, paused, inactive or undated costs", () => {
    expect(nextRenewal(cost({ billing_cycle: "one_time", next_renewal: null }), today)).toBeNull();
    expect(nextRenewal(cost({ status: "paused", next_renewal: "2026-10-01" }), today)).toBeNull();
    expect(nextRenewal(cost({ status: "inactive", next_renewal: "2026-10-01" }), today)).toBeNull();
    expect(nextRenewal(cost({ next_renewal: null }), today)).toBeNull();
  });
});

describe("upcomingRenewals", () => {
  it("filters by window and sorts soonest first", () => {
    const today = "2026-09-28";
    const costs = [
      cost({ name: "Domain", billing_cycle: "yearly", next_renewal: "2026-11-01" }),
      cost({ name: "Supabase", next_renewal: "2026-10-09" }),
      cost({ name: "Vercel", next_renewal: "2026-10-02" }),
      cost({ name: "Paused", status: "paused", next_renewal: "2026-09-30" }),
    ];
    expect(upcomingRenewals(costs, today, 7).map((r) => r.cost.name)).toEqual(["Vercel"]);
    expect(upcomingRenewals(costs, today, 30).map((r) => r.cost.name)).toEqual(["Vercel", "Supabase"]);
    expect(upcomingRenewals(costs, today, null).map((r) => r.cost.name)).toEqual(["Vercel", "Supabase", "Domain"]);
  });
});

describe("cost history", () => {
  it("rebuilds monthly cost from snapshots", () => {
    const vercel = cost({ amount: 40, start_date: "2026-01-10" });
    const openai = cost({ amount: 30, start_date: "2026-03-01" });
    const plausible = cost({ amount: 9, start_date: "2026-02-01", status: "paused" });
    const history = [
      snap(vercel, "2026-01-10", { amount: 20 }),
      snap(vercel, "2026-04-15", { amount: 40 }),
      snap(openai, "2026-03-01"),
      snap(plausible, "2026-02-01", { status: "active" }),
      snap(plausible, "2026-04-02", { status: "paused" }),
    ];
    const series = monthlyCostSeries([vercel, openai, plausible], history, "USD", ["2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05"], "2026-05-20");
    expect(series).toEqual([0, 20, 29, 59, 70, 70]);
  });

  it("uses the first snapshot for months before any history was recorded", () => {
    // Added in September with a January start date.
    const c = cost({ amount: 20, start_date: "2026-01-01" });
    const series = monthlyCostSeries([c], [snap(c, "2026-09-20")], "USD", ["2026-01", "2026-02"], "2026-09-28");
    expect(series).toEqual([20, 20]);
  });

  it("only counts the current month up to today", () => {
    const c = cost({ amount: 20, start_date: "2026-01-01" });
    const history = [snap(c, "2026-01-01"), snap(c, "2026-09-30", { amount: 99 })];
    expect(monthlyCostSeries([c], history, "USD", ["2026-09"], "2026-09-28")).toEqual([20]);
  });

  it("detects cost growth", () => {
    const c = cost({ amount: 30 });
    expect(costTrend(c, [snap(c, "2026-02-01", { amount: 12 }), snap(c, "2026-07-01")])).toEqual({ from: 12, to: 30, since: "2026-02-01" });
    expect(costTrend(c, [snap(c, "2026-02-01")])).toBeNull();
  });

  it("lists recent price changes", () => {
    const c = cost({ name: "OpenAI", amount: 30 });
    const changes = recentCostChanges([c], [snap(c, "2026-02-01", { amount: 12 }), snap(c, "2026-07-01")], "2026-06-30");
    expect(changes).toEqual([{ costId: c.id, name: "OpenAI", from: 12, to: 30, currency: "USD", date: "2026-07-01" }]);
    expect(recentCostChanges([c], [snap(c, "2026-02-01", { amount: 12 }), snap(c, "2026-07-01")], "2026-08-01")).toEqual([]);
  });
});
