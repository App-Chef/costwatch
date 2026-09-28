import { LogoMark } from "@/components/logo";
import { barPath } from "@/components/charts/scale";

// A static, illustrative rendering of the dashboard. The numbers are example
// data (and labelled as such) — not statistics about real users.

const MONTHS = [
  { m: "Apr", r: 620, c: 152 },
  { m: "May", r: 780, c: 158 },
  { m: "Jun", r: 860, c: 171 },
  { m: "Jul", r: 990, c: 171 },
  { m: "Aug", r: 1105, c: 184 },
  { m: "Sep", r: 1240, c: 184 },
];

const CATEGORIES = [
  { name: "Software", v: 42 },
  { name: "Hosting", v: 45 },
  { name: "APIs", v: 32 },
  { name: "Other", v: 28 },
  { name: "Database", v: 25 },
  { name: "Domains", v: 12 },
].sort((a, b) => b.v - a.v);

const RENEWALS = [
  { name: "Vercel", amount: "$20", date: "Oct 04", days: 4 },
  { name: "Supabase", amount: "$25", date: "Oct 11", days: 11 },
  { name: "Domain", amount: "$12", date: "Nov 02", days: 33 },
];

function MiniChart() {
  const W = 360;
  const H = 150;
  const max = 1400;
  const plotH = H - 22;
  const group = W / MONTHS.length;
  const bw = 14;
  const y = (v: number) => plotH - (v / max) * plotH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden="true">
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={0} x2={W} y1={y(max * t)} y2={y(max * t)} stroke="var(--color-hairline)" />
      ))}
      {MONTHS.map((d, i) => {
        const cx = group * i + group / 2;
        return (
          <g key={d.m}>
            <path d={barPath(cx - bw - 1, y(d.r), bw, plotH - y(d.r))} fill="var(--color-revenue)" />
            <path d={barPath(cx + 1, y(d.c), bw, plotH - y(d.c))} fill="var(--color-cost)" />
            <text x={cx} y={H - 4} textAnchor="middle" className={i === MONTHS.length - 1 ? "fill-ink text-[11px] font-semibold" : "fill-muted text-[11px]"}>
              {d.m}
            </text>
          </g>
        );
      })}
      <line x1={0} x2={W} y1={plotH} y2={plotH} stroke="var(--color-ink)" />
    </svg>
  );
}

export function DashboardPreview() {
  return (
    <figure className="relative">
      <div className="overflow-hidden rounded-md border border-line bg-paper shadow-hard-lg">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-line bg-card px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm font-extrabold">
            <LogoMark className="size-5" />
            Costwatch
          </div>
          <div className="flex items-center gap-2 rounded-md border border-line px-2 py-1 text-xs font-semibold">
            <span className="grid size-4 place-items-center rounded-sm bg-accent text-[9px] font-extrabold">A</span>
            Amazu
            <span aria-hidden="true">▾</span>
          </div>
        </div>

        <div className="grid gap-3 p-3 sm:p-4 md:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Monthly revenue", value: "$1,240" },
                { label: "Monthly costs", value: "$184" },
                { label: "Estimated profit", value: "$1,056", emphasis: true },
                { label: "Profit margin", value: "85.2%" },
              ].map((s) => (
                <div key={s.label} className={`rounded-md border border-line bg-card p-3 ${s.emphasis ? "shadow-[3px_3px_0_0_var(--color-accent)]" : ""}`}>
                  <p className="text-[11px] font-semibold text-ink-2 sm:text-xs">{s.label}</p>
                  <p className="tabular mt-1 font-mono text-lg font-semibold sm:text-2xl">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-line bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold">Revenue vs costs</p>
                <div className="flex gap-3 text-[11px] text-ink-2">
                  <span className="flex items-center gap-1"><span className="size-2 rounded-[2px] bg-revenue" />Revenue</span>
                  <span className="flex items-center gap-1"><span className="size-2 rounded-[2px] bg-cost" />Costs</span>
                </div>
              </div>
              <MiniChart />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-md border border-line bg-card">
              <p className="border-b border-hairline px-3 py-2 text-xs font-bold">Upcoming renewals</p>
              <ul className="divide-y divide-hairline text-sm">
                {RENEWALS.map((r) => (
                  <li key={r.name} className="flex items-center justify-between px-3 py-2">
                    <span>
                      <span className="block font-semibold">{r.name}</span>
                      <span className="text-[11px] text-muted">{r.date} · in {r.days} days</span>
                    </span>
                    <span className="tabular font-mono">{r.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-line bg-card p-3">
              <p className="mb-2.5 text-xs font-bold">Where the money goes</p>
              <ul className="flex flex-col gap-2 text-xs">
                {CATEGORIES.map((c) => (
                  <li key={c.name} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    <span className="h-1.5 rounded-sm bg-sunken">
                      <span className="block h-full rounded-sm bg-cost" style={{ width: `${(c.v / 45) * 100}%` }} />
                    </span>
                    <span className="tabular text-right font-mono">${c.v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted">Example data for illustration.</figcaption>
    </figure>
  );
}
