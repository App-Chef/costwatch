import Link from "next/link";
import { Suspense } from "react";
import { CategoryBreakdown } from "@/components/charts/category-breakdown";
import { RevenueCostChart } from "@/components/charts/revenue-cost-chart";
import { AddCostButton } from "@/components/app/cost-actions";
import { CurrencyNotice } from "@/components/app/currency-notice";
import { Onboarding } from "@/components/app/onboarding";
import { PageHeader } from "@/components/app/page-header";
import { AddRevenueButton } from "@/components/app/revenue-actions";
import { Stat } from "@/components/app/stat";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, CostsIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Money } from "@/components/ui/money";
import { OverviewSkeleton } from "@/components/app/skeletons";
import { getDashboardSummary, type DashboardSummary } from "@/lib/data/dashboard";
import { getActiveProduct } from "@/lib/data/products";
import { getRevenue } from "@/lib/data/revenue";
import { getToday } from "@/lib/data/time";
import { formatDate, formatMonth, relativeDays } from "@/lib/dates";
import { formatMoney, formatPercent } from "@/lib/money";
import type { Product } from "@/types/database";

export const metadata = { title: "Overview" };

export default async function OverviewPage() {
  const product = await getActiveProduct();
  if (!product) return <Onboarding />;

  const today = await getToday();
  const sources = await recentSources(product.id);

  return (
    <>
      <PageHeader
        eyebrow={formatMonth(today.slice(0, 7))}
        title={product.name}
        actions={
          <>
            <AddRevenueButton productCurrency={product.currency} today={today} sources={sources} variant="secondary" />
            <AddCostButton productCurrency={product.currency} today={today} />
          </>
        }
      />
      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewContent product={product} today={today} />
      </Suspense>
    </>
  );
}

async function recentSources(productId: string) {
  const revenue = await getRevenue(productId);
  return [...new Set(revenue.map((r) => r.source).filter((s): s is string => Boolean(s)))].slice(0, 12);
}

async function OverviewContent({ product, today }: { product: Product; today: string }) {
  const summary = await getDashboardSummary(product, today);
  const c = product.currency;

  if (summary.costCount === 0 && summary.revenueCount === 0) {
    return <GettingStarted product={product} today={today} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Kpis summary={summary} currency={c} />

      {(summary.costs.excluded.length > 0 || summary.revenue.excluded.length > 0) && (
        <div className="flex flex-col gap-2">
          <CurrencyNotice excluded={summary.costs.excluded} productCurrency={c} kind="costs" perMonth />
          <CurrencyNotice excluded={summary.revenue.excluded} productCurrency={c} kind="revenue" />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="Revenue vs costs" description="Last 6 months · costs are estimated monthly recurring" />
          <div className="p-5">
            {summary.series.some((p) => p.revenue > 0 || p.costs > 0) ? (
              <RevenueCostChart data={summary.series} currency={c} />
            ) : (
              <p className="py-8 text-sm text-muted">Add revenue or recurring costs to see how they compare month by month.</p>
            )}
          </div>
        </Card>

        <Renewals summary={summary} currency={c} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader
            title="Where the money goes"
            description="Monthly equivalent by category"
            action={
              <Link href="/app/costs" className="text-sm font-semibold underline decoration-hairline underline-offset-4 hover:decoration-ink">
                All costs
              </Link>
            }
          />
          <div className="p-5">
            {summary.costs.byCategory.length ? (
              <CategoryBreakdown items={summary.costs.byCategory} currency={c} total={summary.costs.monthlyTotal} />
            ) : (
              <p className="text-sm text-muted">No active recurring costs in {c} yet.</p>
            )}
          </div>
        </Card>

        <Changes summary={summary} />
      </div>
    </div>
  );
}

function Kpis({ summary, currency }: { summary: DashboardSummary; currency: string }) {
  const { revenue, previousRevenue, costs, profit } = summary;
  const loss = profit.profit < 0;
  return (
    <section aria-label="This month" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <Stat
        label="Revenue this month"
        value={formatMoney(revenue.total, currency)}
        sub={
          revenue.count === 0
            ? "No revenue recorded yet this month"
            : `Last month ${formatMoney(previousRevenue.total, currency)}`
        }
      />
      <Stat
        label="Monthly costs"
        value={formatMoney(costs.monthlyTotal, currency)}
        sub={
          <>
            Estimated · {costs.activeRecurringCount} active recurring
            {summary.oneTimeThisMonth > 0 && (
              <span className="block">+ {formatMoney(summary.oneTimeThisMonth, currency)} one-time this month</span>
            )}
          </>
        }
      />
      <Stat
        label="Estimated profit"
        emphasis
        valueText={formatMoney(profit.profit, currency)}
        value={<span className={loss ? "text-loss" : undefined}>{formatMoney(profit.profit, currency)}</span>}
        sub={loss ? <Badge tone="loss">Loss this month</Badge> : "Revenue minus monthly costs"}
      />
      <Stat
        label="Profit margin"
        value={profit.margin === null ? <span className="text-muted">—</span> : formatPercent(profit.margin)}
        sub={profit.margin === null ? "No revenue recorded" : "Profit ÷ revenue"}
      />
    </section>
  );
}

function Renewals({ summary, currency }: { summary: DashboardSummary; currency: string }) {
  return (
    <Card>
      <CardHeader
        title="Upcoming renewals"
        description="Next 45 days"
        action={
          <Link href="/app/renewals" className="text-sm font-semibold underline decoration-hairline underline-offset-4 hover:decoration-ink">
            View all
          </Link>
        }
      />
      {summary.renewals.length ? (
        <ul className="divide-y divide-hairline">
          {summary.renewals.map(({ cost, renewal }) => (
            <li key={cost.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{cost.name}</p>
                <p className="text-[13px] text-muted">
                  {formatDate(renewal.date, "short")} · {relativeDays(renewal.daysUntil)}
                </p>
              </div>
              <Money amount={cost.amount} currency={cost.currency} className="shrink-0 text-[15px]" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-8 text-sm text-muted">
          Nothing renews in the next 45 days. Add a renewal date to a cost to see it here.
        </p>
      )}
      <span className="sr-only">Amounts in {currency} unless marked.</span>
    </Card>
  );
}

function Changes({ summary }: { summary: DashboardSummary }) {
  return (
    <Card>
      <CardHeader title="Cost changes" description="Price changes in the last 90 days" />
      {summary.changes.length ? (
        <ul className="divide-y divide-hairline">
          {summary.changes.map((ch) => {
            const up = ch.to > ch.from;
            return (
              <li key={`${ch.costId}-${ch.date}`} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{ch.name}</p>
                  <p className="text-[13px] text-muted">{formatDate(ch.date)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-sm">
                  <span className="tabular font-mono text-muted line-through decoration-muted/50">{formatMoney(ch.from, ch.currency)}</span>
                  <ArrowRightIcon size={14} className="text-muted" />
                  <span className="tabular font-mono font-semibold">{formatMoney(ch.to, ch.currency)}</span>
                  <Badge tone={up ? "loss" : "gain"}>
                    {up ? <ArrowUpIcon size={12} /> : <ArrowDownIcon size={12} />}
                    {up ? "Up" : "Down"}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-5 py-8 text-sm text-muted">No price changes recently. When you update a cost&apos;s amount, the change shows up here.</p>
      )}
    </Card>
  );
}

function GettingStarted({ product, today }: { product: Product; today: string }) {
  return (
    <Card raised>
      <EmptyState
        icon={<CostsIcon />}
        title="No costs yet."
        action={
          <div className="flex flex-wrap gap-2">
            <AddCostButton productCurrency={product.currency} today={today} label="Add your first cost" />
            <AddRevenueButton productCurrency={product.currency} today={today} sources={[]} variant="secondary" />
          </div>
        }
      >
        <p>Add the services your product depends on to see your real monthly operating cost.</p>
        <ol className="mt-4 flex flex-col gap-1.5 text-sm text-ink-2">
          <li>
            <span className="mr-2 font-mono text-accent-ink">01</span>Hosting, database, domain, email, APIs…
          </li>
          <li>
            <span className="mr-2 font-mono text-accent-ink">02</span>Revenue as it comes in.
          </li>
          <li>
            <span className="mr-2 font-mono text-accent-ink">03</span>Your profit and upcoming renewals appear here.
          </li>
        </ol>
      </EmptyState>
    </Card>
  );
}
