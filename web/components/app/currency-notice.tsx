import { InfoIcon } from "@/components/icons";
import type { CurrencyTotal } from "@/lib/calc";
import { formatMoney } from "@/lib/money";

/** Explains amounts left out of totals because they're in another currency. */
export function CurrencyNotice({ excluded, productCurrency, kind, perMonth }: { excluded: CurrencyTotal[]; productCurrency: string; kind: "costs" | "revenue"; perMonth?: boolean }) {
  if (!excluded.length) return null;
  const count = excluded.reduce((n, e) => n + e.count, 0);
  return (
    <div className="flex gap-2.5 rounded-md border border-warn/40 bg-warn-soft px-3.5 py-3 text-sm text-warn" role="note">
      <InfoIcon size={18} className="mt-px shrink-0" />
      <p>
        <strong className="font-semibold">Not included:</strong>{" "}
        {count} {kind === "costs" ? (count === 1 ? "cost" : "costs") : count === 1 ? "entry" : "entries"} in{" "}
        {excluded.map((e, i) => (
          <span key={e.currency}>
            {i > 0 && ", "}
            <span className="tabular font-mono">{formatMoney(e.monthly, e.currency)}</span>
            {perMonth ? "/mo" : ""}
          </span>
        ))}
        . Costwatch doesn&apos;t convert currencies, so only {productCurrency} amounts are added to the totals.
      </p>
    </div>
  );
}
