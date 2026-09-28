"use client";

import { useState } from "react";
import { formatMonth } from "@/lib/dates";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { niceScale } from "./scale";
import { useWidth } from "./use-width";

const HEIGHT = 200;
const PAD = { top: 16, right: 16, bottom: 28, left: 52 };

export function CostHistoryChart({ data, currency }: { data: { month: string; value: number }[]; currency: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const plotW = Math.max(width - PAD.left - PAD.right, 100);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const { max, step } = niceScale(Math.max(...data.map((d) => d.value), 0));
  const x = (i: number) => PAD.left + (data.length === 1 ? plotW / 2 : (plotW * i) / (data.length - 1));
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.value)}`).join("");
  const area = `${line}L${x(data.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const labelEvery = width < 480 ? 3 : width < 720 ? 2 : 1;
  const current = active ?? data.length - 1;
  const point = data[current];

  return (
    <div>
      <p className="mb-3 text-sm text-ink-2" aria-live="polite">
        <span className="font-semibold text-ink">{formatMonth(point.month)}:</span>{" "}
        <span className="tabular font-mono">{formatMoney(point.value, currency)}</span> / month
      </p>
      <div
        ref={ref}
        className="relative"
        onMouseLeave={() => setActive(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const rel = e.clientX - rect.left - PAD.left;
          const i = Math.round((rel / plotW) * (data.length - 1));
          setActive(Math.min(Math.max(i, 0), data.length - 1));
        }}
      >
        <svg width="100%" height={HEIGHT} role="img" aria-label={`Estimated monthly recurring cost over the last ${data.length} months.`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--color-hairline)" shapeRendering="crispEdges" />
              <text x={PAD.left - 10} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted font-mono text-[11px]">
                {formatMoneyCompact(t, currency)}
              </text>
            </g>
          ))}
          <path d={area} fill="var(--color-cost)" fillOpacity={0.08} />
          <path d={line} fill="none" stroke="var(--color-cost)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {active !== null && (
            <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={y(0)} stroke="var(--color-ink)" strokeDasharray="3 3" shapeRendering="crispEdges" />
          )}
          {data.map((d, i) => (
            <g key={d.month}>
              <circle cx={x(i)} cy={y(d.value)} r={i === current ? 5 : 3.5} fill={i === current ? "var(--color-cost)" : "var(--color-card)"} stroke="var(--color-cost)" strokeWidth={2} />
              {(i % labelEvery === (data.length - 1) % labelEvery) && (
                <text x={x(i)} y={HEIGHT - 8} textAnchor="middle" className={`text-[11px] ${i === data.length - 1 ? "fill-ink font-semibold" : "fill-muted"}`}>
                  {formatMonth(d.month, "short")}
                </text>
              )}
            </g>
          ))}
          <line x1={PAD.left} x2={width - PAD.right} y1={y(0)} y2={y(0)} stroke="var(--color-ink)" shapeRendering="crispEdges" />
        </svg>
      </div>
      <table className="sr-only">
        <caption>Estimated monthly recurring cost by month ({currency})</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.month}>
              <th scope="row">{formatMonth(d.month)}</th>
              <td>{formatMoney(d.value, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
