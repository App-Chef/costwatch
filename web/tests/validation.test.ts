import { describe, expect, it } from "vitest";
import { costSchema, fieldErrors, moneySchema, productSchema, revenueSchema } from "@/lib/validation";

const validCost = {
  name: "Vercel Pro",
  provider: "Vercel",
  amount: "20",
  currency: "USD",
  billing_cycle: "monthly",
  category: "hosting",
  next_renewal: "2026-10-04",
  description: "",
};

describe("moneySchema", () => {
  it.each([
    ["20", 20],
    ["19.99", 19.99],
    ["1,240", 1240],
    ["1 240.50", 1240.5],
    ["0", 0],
  ])("accepts %s", (input, expected) => {
    expect(moneySchema.parse(input)).toBe(expected);
  });

  it.each(["", "-5", "abc", "1.234", "1e5", "999999999999999"])("rejects %s", (input) => {
    expect(moneySchema.safeParse(input).success).toBe(false);
  });
});

describe("costSchema", () => {
  it("parses a valid cost with defaults", () => {
    const c = costSchema.parse(validCost);
    expect(c).toMatchObject({ name: "Vercel Pro", amount: 20, status: "active", description: null, start_date: null });
  });

  it("requires an interval for custom billing", () => {
    const r = costSchema.safeParse({ ...validCost, billing_cycle: "custom" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const errors = fieldErrors(r.error);
      expect(errors.custom_interval_count).toBeDefined();
      expect(errors.custom_interval_unit).toBeDefined();
    }
  });

  it("keeps custom interval only for custom billing", () => {
    expect(costSchema.parse({ ...validCost, billing_cycle: "custom", custom_interval_count: "6", custom_interval_unit: "month" })).toMatchObject({
      custom_interval_count: 6,
      custom_interval_unit: "month",
    });
    expect(costSchema.parse({ ...validCost, custom_interval_count: "6", custom_interval_unit: "month" })).toMatchObject({
      custom_interval_count: null,
      custom_interval_unit: null,
    });
  });

  it("drops the renewal date for one-time costs", () => {
    expect(costSchema.parse({ ...validCost, billing_cycle: "one_time" }).next_renewal).toBeNull();
  });

  it("rejects unknown categories, currencies and bad dates", () => {
    expect(costSchema.safeParse({ ...validCost, category: "crypto" }).success).toBe(false);
    expect(costSchema.safeParse({ ...validCost, currency: "BTC" }).success).toBe(false);
    expect(costSchema.safeParse({ ...validCost, next_renewal: "2026-02-30" }).success).toBe(false);
  });

  it("trims and requires a name", () => {
    const r = costSchema.safeParse({ ...validCost, name: "   " });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).name).toBe("Name is required.");
  });
});

describe("revenueSchema", () => {
  it("parses a quick revenue entry", () => {
    expect(revenueSchema.parse({ amount: "1,240", currency: "USD", date: "2026-09-01", source: "Stripe", description: "" })).toEqual({
      amount: 1240,
      currency: "USD",
      date: "2026-09-01",
      source: "Stripe",
      description: null,
    });
  });

  it("requires a date", () => {
    expect(revenueSchema.safeParse({ amount: "5", currency: "USD", date: "" }).success).toBe(false);
  });
});

describe("productSchema", () => {
  it("validates name length and currency", () => {
    expect(productSchema.safeParse({ name: "Amazu", currency: "RWF" }).success).toBe(true);
    expect(productSchema.safeParse({ name: "x".repeat(81), currency: "USD" }).success).toBe(false);
    expect(productSchema.safeParse({ name: "Amazu", currency: "JPY" }).success).toBe(false);
  });
});

import { safeNextPath } from "@/lib/redirects";

describe("safeNextPath", () => {
  it("allows same-site paths", () => {
    expect(safeNextPath("/app/costs")).toBe("/app/costs");
    expect(safeNextPath("/app?x=1")).toBe("/app?x=1");
  });

  it.each(["https://evil.test", "//evil.test", "/\\evil.test", "javascript:alert(1)", "", null, 42])("rejects %s", (value) => {
    expect(safeNextPath(value)).toBe("/app");
  });
});
