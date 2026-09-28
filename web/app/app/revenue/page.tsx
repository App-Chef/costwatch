import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { AddRevenueButton, RevenueActions } from "@/components/app/revenue-actions";
import { ListSkeleton } from "@/components/app/skeletons";
import { RevenueIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Money } from "@/components/ui/money";
import { calculateProfit, monthlyCostSeries, revenueForMonth } from "@/lib/calc";
import { getCostHistory, getCosts } from "@/lib/data/costs";
import { getActiveProduct } from "@/lib/data/products";
import { getRevenue } from "@/lib/data/revenue";
import { getToday } from "@/lib/data/time";
import { formatDate, formatMonth, monthKey } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { Product, Revenue } from "@/types/database";

export const metadata = { title: "Revenue" };

export default async function RevenuePage() {
  const product = await getActiveProduct();
  if (!product) redirect("/app");
  const [today, revenue] = await Promise.all([getToday(), getRevenue(product.id)]);
  const sources = [...new Set(revenue.map((r) => r.source).filter((s): s is string => Boolean(s)))].slice(0, 12);

  return (
    <>
      <PageHeader
        eyebrow={product.name}
        title="Revenue"
        description="Record what your product earns. Manual entry keeps it simple and private."
        actions={<AddRevenueButton productCurrency={product.currency} today={today} sources={sources} />}
      />
      <Suspense fallback={<ListSkeleton />}>
        <RevenueContent product={product} today={today} revenue={revenue} sources={sources} />
      </Suspense>
    </>
  );
}

async function RevenueContent({ product, today, revenue, sources }: { product: Product; today: string; revenue: Revenue[]; sources: string[] }) {
  if (!revenue.length) {
    return (
      <Card raised>
        <EmptyState
          icon={<RevenueIcon />}
          title="No revenue yet."
          action={<AddRevenueButton productCurrency={product.currency} today={today} sources={[]} label="Add your first revenue" />}
        >
          Enter what your product earned — a Stripe payout, an App Store deposit, a client payment. It takes a few seconds.
        </EmptyState>
      </Card>
    );
  }

  const [costs, history] = await Promise.all([getCosts(product.id), getCostHistory(product.id)]);
  const months = [...new Set(revenue.map((r) => monthKey(r.date)))].sort().reverse();
  const costSeries = monthlyCostSeries(costs, history, product.currency, months, today);
  const c = product.currency;

  return (
    <div className="flex flex-col gap-6">
      {months.map((month, i) => {
        const entries = revenue.filter((r) => monthKey(r.date) === month);
        const totals = revenueForMonth(entries, c, month);
        const monthCosts = costSeries[i];
        const { profit } = calculateProfit(totals.total, monthCosts);
        const headingId = `month-${month}`;
        return (
          <Card key={month}>
            <section aria-labelledby={headingId}>
              <div className="flex flex-col gap-4 border-b border-hairline px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
                <h2 id={headingId} className="text-lg font-bold tracking-tight">
                  {formatMonth(month)}
                </h2>
                <dl className="grid grid-cols-3 gap-4 text-sm sm:gap-8">
                  <div>
                    <dt className="text-muted">Revenue</dt>
                    <dd className="tabular font-mono text-base font-semibold">{formatMoney(totals.total, c)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Costs <span className="sr-only">(estimated)</span><span aria-hidden="true">≈</span></dt>
                    <dd className="tabular font-mono text-base font-semibold">{formatMoney(monthCosts, c)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Profit</dt>
                    <dd className={`tabular font-mono text-base font-semibold ${profit < 0 ? "text-loss" : ""}`}>{formatMoney(profit, c)}</dd>
                  </div>
                </dl>
              </div>
              <ul className="divide-y divide-hairline">
                {entries.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between gap-3 px-5 py-3 transition-colors duration-150 hover:bg-paper/70">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-semibold">
                        <span className="truncate">{entry.source ?? "Revenue"}</span>
                        {entry.currency !== c && <Badge tone="warn">{entry.currency} · not in totals</Badge>}
                      </p>
                      <p className="truncate text-[13px] text-muted">
                        {formatDate(entry.date)}
                        {entry.description ? ` · ${entry.description}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Money amount={entry.amount} currency={entry.currency} className="text-[15px] font-semibold" />
                      <RevenueActions entry={entry} productCurrency={c} today={today} sources={sources} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </Card>
        );
      })}
      <p className="text-sm text-muted">Monthly costs are the estimated recurring cost for each month, based on your cost history.</p>
    </div>
  );
}
