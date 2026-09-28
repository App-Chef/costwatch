import "server-only";

import {
  calculateProfit,
  monthlyCostSeries,
  oneTimeCostsForMonth,
  recentCostChanges,
  revenueForMonth,
  summarizeCosts,
  upcomingRenewals,
  type CostChange,
  type CostSummary,
  type Profit,
  type RevenueTotals,
  type UpcomingRenewal,
} from "@/lib/calc";
import { addDays, addMonths, lastMonths, monthKey, monthStart } from "@/lib/dates";
import type { Cost, Product } from "@/types/database";
import { getCostHistory, getCosts } from "./costs";
import { getRevenue } from "./revenue";

export type MonthPoint = { month: string; revenue: number; costs: number };

export type DashboardSummary = {
  month: string;
  revenue: RevenueTotals;
  previousRevenue: RevenueTotals;
  costs: CostSummary;
  profit: Profit;
  oneTimeThisMonth: number;
  series: MonthPoint[];
  renewals: UpcomingRenewal<Cost>[];
  changes: CostChange[];
  costCount: number;
  revenueCount: number;
};

export async function getDashboardSummary(product: Product, today: string): Promise<DashboardSummary> {
  const months = lastMonths(today, 6);
  const [costs, history, revenue] = await Promise.all([
    getCosts(product.id),
    getCostHistory(product.id),
    getRevenue(product.id, `${months[0]}-01`),
  ]);

  const month = monthKey(today);
  const previousMonth = monthKey(addMonths(monthStart(today), -1));
  const costSummary = summarizeCosts(costs, product.currency);
  const revenueThisMonth = revenueForMonth(revenue, product.currency, month);
  const costSeries = monthlyCostSeries(costs, history, product.currency, months, today);

  return {
    month,
    revenue: revenueThisMonth,
    previousRevenue: revenueForMonth(revenue, product.currency, previousMonth),
    costs: costSummary,
    profit: calculateProfit(revenueThisMonth.total, costSummary.monthlyTotal),
    oneTimeThisMonth: oneTimeCostsForMonth(costs, product.currency, month),
    series: months.map((m, i) => ({
      month: m,
      revenue: revenueForMonth(revenue, product.currency, m).total,
      costs: costSeries[i],
    })),
    renewals: upcomingRenewals(costs, today, 45).slice(0, 5),
    changes: recentCostChanges(costs, history, addDays(today, -90)).slice(0, 4),
    costCount: costs.length,
    revenueCount: revenue.length,
  };
}

export async function getUpcomingRenewals(product: Product, today: string, withinDays: number | null) {
  const costs = await getCosts(product.id);
  return upcomingRenewals(costs, today, withinDays);
}

export async function getCostHistorySeries(product: Product, today: string, count = 12) {
  const months = lastMonths(today, count);
  const [costs, history] = await Promise.all([getCosts(product.id), getCostHistory(product.id)]);
  const values = monthlyCostSeries(costs, history, product.currency, months, today);
  return months.map((month, i) => ({ month, value: values[i] }));
}
