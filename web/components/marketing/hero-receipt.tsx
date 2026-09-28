// The hero illustration: a receipt printing out of a slot, one small cost at a
// time, until the total lands and gets stamped. Pure CSS animation (see
// .receipt-* in globals.css). Amounts are example data, labelled as such.

const LINES = [
  { item: "Hosting", cycle: "monthly", amount: 20 },
  { item: "Database", cycle: "monthly", amount: 25 },
  { item: "AI API", cycle: "usage", amount: 32 },
  { item: "Domain", cycle: "$15/yr ÷ 12", amount: 1.25 },
  { item: "Email", cycle: "monthly", amount: 6 },
  { item: "Design tools", cycle: "monthly", amount: 15 },
  { item: "Monitoring", cycle: "monthly", amount: 28 },
];

const REVENUE = 400;
const TOTAL = LINES.reduce((sum, l) => sum + l.amount, 0);
const PROFIT = REVENUE - TOTAL;
const MARGIN = Math.round((PROFIT / REVENUE) * 100);

const fmt = (n: number) => n.toFixed(2);

// Per-line stagger, in ms, so the items print after the paper starts feeding.
const LINE_START = 700;
const LINE_STEP = 260;
const TOTAL_AT = LINE_START + LINES.length * LINE_STEP + 150;

export function HeroReceipt() {
  return (
    <figure className="relative mx-auto w-full max-w-88" aria-label={`Example monthly receipt: ${LINES.length} costs totalling $${fmt(TOTAL)}, profit $${fmt(PROFIT)}`}>
      {/* Printer slot */}
      <div className="relative z-10 h-5 rounded-md border border-line bg-ink shadow-hard" aria-hidden="true">
        <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-paper/25" />
        <span className="receipt-led absolute top-1/2 right-2 size-1.5 -translate-y-1/2 rounded-full bg-accent" />
      </div>

      {/* Paper feed: the receipt slides out from under the slot */}
      <div className="-mt-2 overflow-hidden px-3 pb-6 drop-shadow-[3px_3px_0_var(--color-line)]">
        <div className="receipt-feed receipt-edge relative border-x border-line bg-card px-5 pt-7 pb-9 font-mono text-[13px]" aria-hidden="true">
          <div className="text-center">
            <p className="font-bold tracking-[0.2em]">COSTWATCH</p>
            <p className="mt-0.5 text-[11px] text-muted">MONTHLY RUN · EXAMPLE DATA</p>
          </div>
          <div className="my-3 border-t-2 border-dashed border-hairline" />

          <ul>
            {LINES.map((l, i) => (
              <li key={l.item} className="receipt-line flex items-baseline gap-2 py-0.75" style={{ animationDelay: `${LINE_START + i * LINE_STEP}ms` }}>
                <span className="font-sans text-[14px]">{l.item}</span>
                <span className="truncate text-[11px] text-muted">{l.cycle}</span>
                <span className="flex-1 -translate-y-0.75 border-b border-dotted border-hairline" />
                <span className="tabular">{fmt(l.amount)}</span>
              </li>
            ))}
          </ul>

          <div className="receipt-line mt-3 flex items-baseline justify-between border-t-2 border-ink pt-2.5" style={{ animationDelay: `${TOTAL_AT}ms` }}>
            <span className="font-sans text-[15px] font-bold">Monthly cost</span>
            <span
              className="receipt-total tabular text-lg font-bold"
              style={{ animationDelay: `${TOTAL_AT}ms`, "--to": Math.floor(TOTAL) } as React.CSSProperties}
              data-cents={fmt(TOTAL).slice(-3)}
            />
          </div>
          <div className="receipt-line mt-1 flex items-baseline justify-between text-ink-2" style={{ animationDelay: `${TOTAL_AT + 350}ms` }}>
            <span className="font-sans text-[14px]">Revenue</span>
            <span className="tabular text-revenue">+{fmt(REVENUE)}</span>
          </div>
          <div className="receipt-line mt-1 flex items-baseline justify-between" style={{ animationDelay: `${TOTAL_AT + 600}ms` }}>
            <span className="font-sans text-[14px] font-bold">Profit</span>
            <span className="tabular font-bold text-gain">
              {fmt(PROFIT)} <span className="text-[11px] font-semibold">({MARGIN}%)</span>
            </span>
          </div>

          <div className="receipt-line mt-5" style={{ animationDelay: `${TOTAL_AT + 800}ms` }}>
            <div className="h-8 bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_2px,transparent_2px_4px,var(--color-ink)_4px_5px,transparent_5px_8px,var(--color-ink)_8px_11px,transparent_11px_13px)]" />
            <p className="mt-1.5 text-center text-[10px] tracking-[0.3em] text-muted">NO SURPRISES NEXT MONTH</p>
          </div>

          {/* Rubber stamp */}
          <div
            className="receipt-stamp pointer-events-none absolute right-4 bottom-12 rounded-sm border-[3px] border-accent bg-card px-2.5 py-1 font-sans text-sm font-black tracking-[0.12em] text-accent"
            style={{ animationDelay: `${TOTAL_AT + 1200}ms` }}
          >
            ACCOUNTED FOR
          </div>
        </div>
      </div>
    </figure>
  );
}
