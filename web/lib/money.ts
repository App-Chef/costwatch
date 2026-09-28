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
  return formatter(currency, opts.exact || !whole ? digits : 0).format(Math.abs(rounded) < Number.EPSILON ? 0 : rounded);
}

/**
 * Compact form for chart axes: "$1.2k". Built by hand rather than with
 * Intl's compact notation, whose output differs between Node and browsers
 * (and would cause hydration mismatches).
 */
export function formatMoneyCompact(amount: number, currency: string): string {
  const abs = Math.abs(amount);
  const [divisor, suffix] = abs >= 1e6 ? [1e6, "M"] : abs >= 1e3 ? [1e3, "k"] : [1, ""];
  const scaled = roundTo(amount / divisor, suffix ? 1 : 2);
  const digits = Number.isInteger(scaled) ? 0 : suffix ? 1 : 2;
  return formatter(currency, digits).format(scaled) + suffix;
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
