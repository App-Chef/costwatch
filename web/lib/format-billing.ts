import { BILLING_CYCLES, INTERVAL_UNITS } from "./constants";
import type { Billing } from "./calc";

export function billingLabel(b: Omit<Billing, "amount">): string {
  if (b.billing_cycle === "custom" && b.custom_interval_count && b.custom_interval_unit) {
    const unit = INTERVAL_UNITS.find((u) => u.value === b.custom_interval_unit);
    return b.custom_interval_count === 1 ? `Every ${unit?.label}` : `Every ${b.custom_interval_count} ${unit?.plural}`;
  }
  return BILLING_CYCLES.find((c) => c.value === b.billing_cycle)?.label ?? "";
}

export function billingSuffix(b: Omit<Billing, "amount">): string {
  switch (b.billing_cycle) {
    case "monthly":
      return "/mo";
    case "quarterly":
      return "/qtr";
    case "yearly":
      return "/yr";
    case "one_time":
      return "once";
    case "custom":
      return b.custom_interval_count && b.custom_interval_unit
        ? `/${b.custom_interval_count === 1 ? "" : b.custom_interval_count}${b.custom_interval_unit.slice(0, 1)}`
        : "";
  }
}
