"use client";

import { useId, useState } from "react";
import { formatMonth } from "@/lib/dates";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { barPath, niceScale } from "./scale";
import { useWidth } from "./use-width";

export type RevenueCostPoint = { month: string; revenue: number; costs: number };

const HEIGHT = 220;
const PAD_BASE = { top: 16, right: 8, bottom: 28 };

export function RevenueCostChart({ data, currency }: { data: RevenueCostPoint[]; currency: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const tableId = useId();

  const { max, step } = niceScale(Math.max(...data.flatMap((d) => [d.revenue, d.costs]), 0));
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);
  // Axis labels are 11px mono (~6.7px per character); leave room for the longest.
  const labelWidth = Math.max(...ticks.map((t) => formatMoneyCompact(t, currency).length)) * 6.7;
  const PAD = { ...PAD_BASE, left: Math.ceil(labelWidth + 14) };
  const plotW = Math.max(width - PAD.left - PAD.right, 100);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const group = plotW / data.length;
  const barW = Math.max(6, Math.min(26, group * 0.3));
  const last = data.length - 1;

  const tooltip = active !== null ? data[active] : null;
  const tooltipLeft = active !== null ? PAD.left + group * active + group / 2 : 0;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <ul className="flex items-center gap-4 text-sm text-ink-2" aria-label="Legend">
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-[3px] bg-revenue" aria-hidden="true" /> Revenue
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-[3px] bg-cost" aria-hidden="true" /> Recurring costs
          </li>
        </ul>
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          aria-expanded={asTable}
          aria-controls={tableId}
          className="text-sm font-semibold text-ink-2 underline decoration-hairline underline-offset-4 transition-colors duration-150 hover:text-ink hover:decoration-ink"
        >
          {asTable ? "Show chart" : "Show as table"}
        </button>
      </div>

      {asTable ? (
        <div id={tableId} className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Revenue and recurring costs by month ({currency})</caption>
            <thead>
              <tr className="border-b border-hairline text-left text-muted">
                <th scope="col" className="py-2 font-semibold">Month</th>
                <th scope="col" className="py-2 text-right font-semibold">Revenue</th>
                <th scope="col" className="py-2 text-right font-semibold">Costs</th>
                <th scope="col" className="py-2 text-right font-semibold">Profit</th>
              </tr>
            </thead>
            <tbody className="tabular font-mono">
              {data.map((d) => (
                <tr key={d.month} className="border-b border-hairline last:border-0">
                  <th scope="row" className="py-2 text-left font-sans font-medium">{formatMonth(d.month)}</th>
                  <td className="py-2 text-right">{formatMoney(d.revenue, currency)}</td>
                  <td className="py-2 text-right">{formatMoney(d.costs, currency)}</td>
                  <td className="py-2 text-right">{formatMoney(d.revenue - d.costs, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={ref} className="relative" onMouseLeave={() => setActive(null)}>
          <svg
            width="100%"
            height={HEIGHT}
            role="img"
            aria-label={`Revenue and recurring costs for the last ${data.length} months. Use "Show as table" for exact values.`}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--color-hairline)" strokeWidth={1} shapeRendering="crispEdges" />
                <text x={PAD.left - 10} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted font-mono text-[11px]">
                  {formatMoneyCompact(t, currency)}
                </text>
              </g>
            ))}
            {data.map((d, i) => {
              const cx = PAD.left + group * i + group / 2;
              const revX = cx - barW - 1;
              const costX = cx + 1;
              return (
                <g key={d.month}>
                  {active === i && <rect x={PAD.left + group * i + 2} y={PAD.top} width={group - 4} height={plotH} fill="var(--color-sunken)" rx={4} />}
                  <path d={barPath(revX, y(d.revenue), barW, y(0) - y(d.revenue))} fill="var(--color-revenue)" />
                  <path d={barPath(costX, y(d.costs), barW, y(0) - y(d.costs))} fill="var(--color-cost)" />
                  <text x={cx} y={HEIGHT - 8} textAnchor="middle" className={`text-[11px] ${i === last ? "fill-ink font-semibold" : "fill-muted"}`}>
                    {formatMonth(d.month, "short")}
                  </text>
                  <rect
                    x={PAD.left + group * i}
                    y={PAD.top}
                    width={group}
                    height={plotH + PAD.bottom}
                    fill="transparent"
                    onMouseEnter={() => setActive(i)}
                    onTouchStart={() => setActive(i)}
                  />
                </g>
              );
            })}
            <line x1={PAD.left} x2={width - PAD.right} y1={y(0)} y2={y(0)} stroke="var(--color-ink)" strokeWidth={1} shapeRendering="crispEdges" />
          </svg>

          {tooltip && (
            <div
              className="pointer-events-none absolute top-2 z-10 w-44 animate-fade-in rounded-md border border-line bg-card p-3 text-sm shadow-hard-sm"
              style={{ left: Math.min(Math.max(tooltipLeft - 88, 0), Math.max(width - 176, 0)) }}
              role="status"
            >
              <p className="mb-2 font-bold">{formatMonth(tooltip.month)}</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt className="flex items-center gap-1.5 text-ink-2">
                  <span className="size-2.5 rounded-[2px] bg-revenue" aria-hidden="true" />
                  Revenue
                </dt>
                <dd className="tabular text-right font-mono">{formatMoney(tooltip.revenue, currency)}</dd>
                <dt className="flex items-center gap-1.5 text-ink-2">
                  <span className="size-2.5 rounded-[2px] bg-cost" aria-hidden="true" />
                  Costs
                </dt>
                <dd className="tabular text-right font-mono">{formatMoney(tooltip.costs, currency)}</dd>
                <dt className="border-t border-hairline pt-1 font-semibold">Profit</dt>
                <dd className="tabular border-t border-hairline pt-1 text-right font-mono font-semibold">
                  {formatMoney(tooltip.revenue - tooltip.costs, currency)}
                </dd>
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
