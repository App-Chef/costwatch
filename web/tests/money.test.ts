import { describe, expect, it } from "vitest";
import { formatMoney, sumMoney } from "@/lib/money";

describe("money", () => {
  it("formats whole amounts without decimals and others with them", () => {
    expect(formatMoney(20, "USD")).toBe("$20");
    expect(formatMoney(19.5, "USD")).toBe("$19.50");
    expect(formatMoney(1240, "USD")).toBe("$1,240");
    expect(formatMoney(1.0000001, "USD")).toBe("$1");
    expect(formatMoney(-50, "EUR")).toBe("-€50");
  });

  it("respects currencies without minor units", () => {
    expect(formatMoney(15000, "RWF")).toMatch(/15,000/);
    expect(formatMoney(15000.4, "RWF")).not.toMatch(/\./);
  });

  it("sums without floating point drift", () => {
    expect(sumMoney([0.1, 0.2])).toBe(0.3);
    expect(sumMoney([900.1, 339.9])).toBe(1240);
  });
});

import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("quotes and neutralises spreadsheet formulas", () => {
    expect(toCsv([["a,b", 'say "hi"', null, 5, "=SUM(A1)"]])).toBe(`"a,b","say ""hi""",,5,'=SUM(A1)`);
  });
});
