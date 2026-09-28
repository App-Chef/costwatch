const formatters = new Map<string, Intl.NumberFormat>();

function formatter(currency: string, fractionDigits: number | null): Intl.NumberFormat {
  const key = `${currency}:${fractionDigits}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      ...(fractionDigits === null ? {} : { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }),
    });
    formatters.set(key, f);
  }
  return f;
}

function minorUnits(currency: string): number {
  return formatter(currency, null).resolvedOptions().maximumFractionDigits ?? 2;
}

/**
 * Formats an amount in its own currency. Whole amounts drop the decimals
 * ("$20", not "$20.00") to keep the dashboard calm; everything else uses the
 * currency's normal precision.
 */
export function formatMoney(amount: number, currency: string, opts: { exact?: boolean } = {}): string {
  const digits = minorUnits(currency);
  const rounded = roundTo(amount, digits);
  const whole = Number.isInteger(rounded);
  const f = formatter(currency, opts.exact || !whole ? digits : 0);
  const out = f.format(Math.abs(rounded) < Number.EPSILON ? 0 : rounded);
  return out;
}

/** Compact form for chart axes: "$1.2k". */
export function formatMoneyCompact(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function roundTo(amount: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round((amount + Number.EPSILON) * f) / f;
}

/** Sums money without accumulating floating point error (works in cents). */
export function sumMoney(values: number[]): number {
  return values.reduce((acc, v) => acc + Math.round(v * 100), 0) / 100;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
