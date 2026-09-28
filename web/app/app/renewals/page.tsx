import Link from "next/link";
import { redirect } from "next/navigation";
import { CostActions } from "@/components/app/cost-actions";
import { PageHeader } from "@/components/app/page-header";
import { InfoIcon, RenewalsIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Money } from "@/components/ui/money";
import { upcomingRenewals } from "@/lib/calc";
import { cn } from "@/lib/cn";
import { getCosts } from "@/lib/data/costs";
import { getActiveProduct } from "@/lib/data/products";
import { getToday } from "@/lib/data/time";
import { formatDate } from "@/lib/dates";
import { billingSuffix } from "@/lib/format-billing";
import { formatMoney, sumMoney } from "@/lib/money";

export const metadata = { title: "Renewals" };

const WINDOWS = [
  { value: "7", label: "7 days", days: 7 },
  { value: "30", label: "30 days", days: 30 },
  { value: "90", label: "90 days", days: 90 },
  { value: "all", label: "All", days: null },
] as const;

export default async function RenewalsPage({ searchParams }: PageProps<"/app/renewals">) {
  const product = await getActiveProduct();
  if (!product) redirect("/app");

  const { within } = await searchParams;
  const window = WINDOWS.find((w) => w.value === within) ?? WINDOWS[1];
  const [today, costs] = await Promise.all([getToday(), getCosts(product.id)]);
  const renewals = upcomingRenewals(costs, today, window.days);
  const undated = costs.filter((c) => c.status === "active" && c.billing_cycle !== "one_time" && !c.next_renewal);
  const due = sumMoney(renewals.filter((r) => r.cost.currency === product.currency).map((r) => r.cost.amount));

  return (
    <>
      <PageHeader eyebrow={product.name} title="Renewals" description="What's about to charge you, soonest first. Only active costs are shown." />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Time window" className="inline-flex rounded-md border border-line bg-card p-1">
          {WINDOWS.map((w) => {
            const active = w.value === window.value;
            return (
              <Link
                key={w.value}
                href={w.value === "30" ? "/app/renewals" : `/app/renewals?within=${w.value}`}
                aria-current={active ? "page" : undefined}
                scroll={false}
                className={cn(
                  "rounded-sm px-3 py-1.5 text-sm font-semibold transition-colors duration-150",
                  active ? "bg-ink text-white" : "text-ink-2 hover:bg-sunken hover:text-ink",
                )}
              >
                {w.label}
              </Link>
            );
          })}
        </nav>
        {renewals.length > 0 && (
          <p className="text-sm text-ink-2">
            <span className="tabular font-mono font-semibold text-ink">{formatMoney(due, product.currency)}</span> due{" "}
            {window.days ? `in the next ${window.days} days` : "across all upcoming renewals"}
          </p>
        )}
      </div>

      {renewals.length ? (
        <Card>
          <ol className="divide-y divide-hairline">
            {renewals.map(({ cost, renewal }) => (
              <li key={cost.id} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 px-4 py-4 sm:grid-cols-[6rem_1fr_auto_auto] sm:gap-5 sm:px-5">
                <div className={cn("rounded-md border px-2 py-1.5 text-center", renewal.daysUntil <= 7 ? "border-line bg-accent-soft" : "border-hairline bg-paper")}>
                  <p className="tabular font-mono text-xl leading-none font-semibold">{renewal.daysUntil}</p>
                  <p className="mt-1 text-[11px] font-semibold text-muted uppercase">{renewal.daysUntil === 1 ? "day" : "days"}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{cost.name}</p>
                  <p className="text-[13px] text-muted">
                    {formatDate(renewal.date, "long")}
                    {renewal.projected && (
                      <span className="ml-1.5 inline-flex align-middle">
                        <Badge tone="muted">Estimated</Badge>
                      </span>
                    )}
                  </p>
                </div>
                <p className="text-right">
                  <Money amount={cost.amount} currency={cost.currency} className="text-[15px] font-semibold" />
                  <span className="block text-xs text-muted">{billingSuffix(cost)}</span>
                </p>
                <div className="hidden sm:block">
                  <CostActions cost={cost} productCurrency={product.currency} today={today} />
                </div>
              </li>
            ))}
          </ol>
        </Card>
      ) : (
        <Card>
          <EmptyState icon={<RenewalsIcon />} title={window.days ? `Nothing renews in the next ${window.days} days.` : "No upcoming renewals."}>
            {costs.length ? (
              <>Add a next renewal date to your recurring costs to see them here.</>
            ) : (
              <>
                Add your costs with a renewal date and they&apos;ll show up here.{" "}
                <Link href="/app/costs" className="font-semibold underline underline-offset-4">
                  Go to costs
                </Link>
              </>
            )}
          </EmptyState>
        </Card>
      )}

      {(undated.length > 0 || renewals.some((r) => r.renewal.projected)) && (
        <div className="mt-4 flex flex-col gap-2 text-sm text-ink-2">
          {renewals.some((r) => r.renewal.projected) && (
            <p className="flex gap-2">
              <InfoIcon size={16} className="mt-0.5 shrink-0 text-muted" />
              &ldquo;Estimated&rdquo; dates were projected forward from a renewal date that has passed. Edit the cost to confirm the real date.
            </p>
          )}
          {undated.length > 0 && (
            <p className="flex gap-2">
              <InfoIcon size={16} className="mt-0.5 shrink-0 text-muted" />
              {undated.length} active {undated.length === 1 ? "cost has" : "costs have"} no renewal date: {undated.map((c) => c.name).join(", ")}.
            </p>
          )}
        </div>
      )}
    </>
  );
}
