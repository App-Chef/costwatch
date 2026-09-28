import type { BillingCycle, CostStatus, IntervalUnit } from "@/types/database";

// Mirrors public.currencies. To add a currency, insert it in a migration and
// add it here.
export const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "RWF", name: "Rwandan Franc" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
export const CURRENCY_CODES = CURRENCIES.map((c) => c.code) as [CurrencyCode, ...CurrencyCode[]];

// Mirrors public.categories.
export const CATEGORIES = [
  { slug: "hosting", name: "Hosting" },
  { slug: "database", name: "Database" },
  { slug: "domain", name: "Domain" },
  { slug: "email", name: "Email" },
  { slug: "api", name: "API" },
  { slug: "software", name: "Software" },
  { slug: "marketing", name: "Marketing" },
  { slug: "infrastructure", name: "Infrastructure" },
  { slug: "design", name: "Design" },
  { slug: "other", name: "Other" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];

export function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? "Other";
}

export const BILLING_CYCLES: { value: BillingCycle; label: string; short: string }[] = [
  { value: "monthly", label: "Monthly", short: "/ month" },
  { value: "quarterly", label: "Quarterly", short: "/ quarter" },
  { value: "yearly", label: "Yearly", short: "/ year" },
  { value: "custom", label: "Custom", short: "" },
  { value: "one_time", label: "One-time", short: "once" },
];

export const BILLING_CYCLE_VALUES = BILLING_CYCLES.map((b) => b.value) as [BillingCycle, ...BillingCycle[]];

export const INTERVAL_UNITS: { value: IntervalUnit; label: string; plural: string }[] = [
  { value: "day", label: "day", plural: "days" },
  { value: "week", label: "week", plural: "weeks" },
  { value: "month", label: "month", plural: "months" },
  { value: "year", label: "year", plural: "years" },
];

export const INTERVAL_UNIT_VALUES = INTERVAL_UNITS.map((u) => u.value) as [IntervalUnit, ...IntervalUnit[]];

export const COST_STATUSES: { value: CostStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "inactive", label: "Inactive" },
];

export const COST_STATUS_VALUES = COST_STATUSES.map((s) => s.value) as [CostStatus, ...CostStatus[]];

export const GITHUB_URL = "https://github.com/App-Chef/costwatch";

export const PRODUCT_COOKIE = "cw_product";
export const TIMEZONE_COOKIE = "cw_tz";
