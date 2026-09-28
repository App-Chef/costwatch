import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CostHistoryChart } from "@/components/charts/cost-history-chart";
import { AddCostButton, CostActions } from "@/components/app/cost-actions";
import { CurrencyNotice } from "@/components/app/currency-notice";
import { PageHeader } from "@/components/app/page-header";
import { ListSkeleton } from "@/components/app/skeletons";
import { StatusBadge } from "@/components/app/status-badge";
import { ArrowDownIcon, ArrowUpIcon, CostsIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Money } from "@/components/ui/money";
import { Skeleton } from "@/components/ui/skeleton";
import { costTrend, monthlyEquivalent, nextRenewal, summarizeCosts, type CostTrend } from "@/lib/calc";
import { categoryName } from "@/lib/constants";
import { getCostHistory, getCosts } from "@/lib/data/costs";
import { getCostHistorySeries } from "@/lib/data/dashboard";
import { getActiveProduct } from "@/lib/data/products";
import { getToday } from "@/lib/data/time";
import { formatDate } from "@/lib/dates";
import { billingLabel, billingSuffix } from "@/lib/format-billing";
import { formatMoney } from "@/lib/money";
import type { Cost, Product } from "@/types/database";

export const metadata = { title: "Costs" };

export default async function CostsPage() {
  const product = await getActiveProduct();
  if (!product) redirect("/app");
  const today = await getToday();

  return (
    <>
      <PageHeader
        eyebrow={product.name}
        title="Costs"
        description="Everything this product pays for. Paused and inactive costs stay here but aren't counted."
        actions={<AddCostButton productCurrency={product.currency} today={today} />}
      />
      <Suspense fallback={<ListSkeleton rows={6} />}>
        <CostsContent product={product} today={today} />
      </Suspense>
    </>
  );
}

async function CostsContent({ product, today }: { product: Product; today: string }) {
  const [costs, history] = await Promise.all([getCosts(product.id), getCostHistory(product.id)]);
  const c = product.currency;

  if (!costs.length) {
    return (
      <Card raised>
        <EmptyState
          icon={<CostsIcon />}
          title="No costs yet."
          action={<AddCostButton productCurrency={c} today={today} label="Add your first cost" />}
        >
          Add the services your product depends on to see your real monthly operating cost.
        </EmptyState>
      </Card>
    );
  }

  const summary = summarizeCosts(costs, c);
  const recurring = costs.filter((x) => x.billing_cycle !== "one_time" && x.status !== "inactive");
  const oneTime = costs.filter((x) => x.billing_cycle === "one_time" && x.status !== "inactive");
  const inactive = costs.filter((x) => x.status === "inactive");
  const trends = new Map(costs.map((x) => [x.id, costTrend(x, history)]));

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Cost summary" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <SummaryTile label="Per month" value={formatMoney(summary.monthlyTotal, c)} note="Estimated" />
        <SummaryTile label="Per year" value={formatMoney(summary.monthlyTotal * 12, c)} note="At today's prices" />
        <SummaryTile label="Active recurring" value={String(summary.activeRecurringCount)} note={`${costs.length} tracked in total`} className="col-span-2 sm:col-span-1" />
      </section>

      <CurrencyNotice excluded={summary.excluded} productCurrency={c} kind="costs" perMonth />

      <CostTable title="Recurring" costs={recurring} product={product} today={today} trends={trends} />

      {oneTime.length > 0 && <CostTable title="One-time" description="Paid once. Not part of the monthly cost." costs={oneTime} product={product} today={today} trends={trends} />}

      <Card>
        <CardHeader title="Cost history" description="Estimated monthly recurring cost, last 12 months" />
        <div className="p-5">
          <Suspense fallback={<Skeleton className="h-56" />}>
            <History product={product} today={today} />
          </Suspense>
        </div>
      </Card>

      {inactive.length > 0 && (
        <CostTable title="Inactive" description="Costs you no longer pay. Kept for history." costs={inactive} product={product} today={today} trends={trends} muted />
      )}
    </div>
  );
}

async function History({ product, today }: { product: Product; today: string }) {
  const series = await getCostHistorySeries(product, today);
  if (!series.some((p) => p.value > 0)) {
    return <p className="py-6 text-sm text-muted">History appears once you have active recurring costs in {product.currency}.</p>;
  }
  return <CostHistoryChart data={series} currency={product.currency} />;
}

function SummaryTile({ label, value, note, className }: { label: string; value: string; note: string; className?: string }) {
  return (
    <div className={`rounded-md border border-line bg-card px-4 py-3.5 ${className ?? ""}`}>
      <p className="text-sm font-semibold text-ink-2">{label}</p>
      <p className="tabular mt-1 font-mono text-xl font-semibold sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{note}</p>
    </div>
  );
}

function Trend({ trend, currency }: { trend: CostTrend | null | undefined; currency: string }) {
  if (!trend) return null;
  const up = trend.to > trend.from;
  return (
    <Badge tone={up ? "loss" : "gain"} className="font-mono">
      {up ? <ArrowUpIcon size={12} /> : <ArrowDownIcon size={12} />}
      <span className="sr-only">{up ? "Up" : "Down"} from</span>
      {formatMoney(trend.from, currency)}
      <span className="sr-only">per month since {formatDate(trend.since)}</span>
    </Badge>
  );
}

function CostTable({
  title,
  description,
  costs,
  product,
  today,
  trends,
  muted,
}: {
  title: string;
  description?: string;
  costs: Cost[];
  product: Product;
  today: string;
  trends: Map<string, CostTrend | null>;
  muted?: boolean;
}) {
  if (!costs.length) return null;
  const headingId = `costs-${title.toLowerCase().replace(/\W+/g, "-")}`;

  return (
    <Card className={muted ? "bg-card/60" : undefined}>
      <CardHeader id={headingId} title={`${title} · ${costs.length}`} description={description} />

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm" aria-labelledby={headingId}>
          <thead>
            <tr className="border-b border-hairline text-left text-xs tracking-wide text-muted uppercase">
              <th scope="col" className="px-5 py-2.5 font-semibold">Service</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Category</th>
              <th scope="col" className="px-3 py-2.5 text-right font-semibold">Cost</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Billing</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">{title === "One-time" ? "Paid" : "Next renewal"}</th>
              <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
              <th scope="col" className="w-12 px-3 py-2.5"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {costs.map((cost) => {
              const renewal = nextRenewal(cost, today);
              const monthly = monthlyEquivalent(cost);
              return (
                <tr key={cost.id} className={`border-b border-hairline transition-colors duration-150 last:border-0 hover:bg-paper/70 ${muted ? "text-ink-2" : ""}`}>
                  <th scope="row" className="px-5 py-3 text-left font-normal">
                    <p className="font-semibold text-ink">{cost.name}</p>
                    {cost.provider && <p className="text-[13px] text-muted">{cost.provider}</p>}
                  </th>
                  <td className="px-3 py-3">{categoryName(cost.category)}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Trend trend={trends.get(cost.id)} currency={cost.currency} />
                      <Money amount={cost.amount} currency={cost.currency} className="text-[15px] font-semibold text-ink" />
                    </div>
                    {monthly !== null && cost.billing_cycle !== "monthly" && (
                      <p className="tabular font-mono text-xs text-muted">≈ {formatMoney(monthly, cost.currency)}/mo</p>
                    )}
                    {cost.currency !== product.currency && <p className="text-xs text-warn">Not in {product.currency} totals</p>}
                  </td>
                  <td className="px-3 py-3">{billingLabel(cost)}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {cost.billing_cycle === "one_time" ? (
                      cost.start_date ? formatDate(cost.start_date) : <span className="text-muted">—</span>
                    ) : renewal ? (
                      <>
                        {formatDate(renewal.date)}
                        <p className="text-xs text-muted">in {renewal.daysUntil} {renewal.daysUntil === 1 ? "day" : "days"}</p>
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3"><StatusBadge status={cost.status} /></td>
                  <td className="px-3 py-3 text-right">
                    <CostActions cost={cost} productCurrency={product.currency} today={today} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-hairline md:hidden" aria-labelledby={headingId}>
        {costs.map((cost) => {
          const renewal = nextRenewal(cost, today);
          return (
            <li key={cost.id} className="flex items-start justify-between gap-3 px-4 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold">{cost.name}</p>
                  <StatusBadge status={cost.status} />
                </div>
                <p className="mt-0.5 text-[13px] text-muted">
                  {categoryName(cost.category)}
                  {cost.provider ? ` · ${cost.provider}` : ""}
                </p>
                <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <Money amount={cost.amount} currency={cost.currency} className="text-lg font-semibold" />
                  <span className="text-sm text-muted">{billingSuffix(cost)}</span>
                  <Trend trend={trends.get(cost.id)} currency={cost.currency} />
                </p>
                {renewal && (
                  <p className="mt-1 text-[13px] text-ink-2">
                    Renews {formatDate(renewal.date, "short")} · in {renewal.daysUntil} {renewal.daysUntil === 1 ? "day" : "days"}
                  </p>
                )}
                {cost.currency !== product.currency && <p className="mt-1 text-xs text-warn">Not in {product.currency} totals</p>}
              </div>
              <CostActions cost={cost} productCurrency={product.currency} today={today} />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
