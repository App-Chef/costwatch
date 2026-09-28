import { NextResponse, type NextRequest } from "next/server";
import { toCsv } from "@/lib/csv";
import { getCurrentUser } from "@/lib/data/auth";
import { getCosts } from "@/lib/data/costs";
import { getActiveProduct } from "@/lib/data/products";
import { getRevenue } from "@/lib/data/revenue";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Not signed in", { status: 401 });
  const product = await getActiveProduct();
  if (!product) return new NextResponse("No product", { status: 404 });

  const type = request.nextUrl.searchParams.get("type") === "revenue" ? "revenue" : "costs";
  let csv: string;
  if (type === "costs") {
    const costs = await getCosts(product.id);
    csv = toCsv([
      ["name", "provider", "category", "amount", "currency", "billing_cycle", "custom_interval_count", "custom_interval_unit", "status", "start_date", "next_renewal", "notes"],
      ...costs.map((c) => [c.name, c.provider, c.category, c.amount, c.currency, c.billing_cycle, c.custom_interval_count, c.custom_interval_unit, c.status, c.start_date, c.next_renewal, c.description]),
    ]);
  } else {
    const revenue = await getRevenue(product.id);
    csv = toCsv([["date", "amount", "currency", "source", "description"], ...revenue.map((r) => [r.date, r.amount, r.currency, r.source, r.description])]);
  }

  const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "product";
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-${type}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
