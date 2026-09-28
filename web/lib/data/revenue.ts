import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { RevenueInput } from "@/lib/validation";
import type { Revenue } from "@/types/database";
import { requireUser } from "./auth";
import { dbError, UserFacingError } from "./errors";

/** Revenue entries for a product, newest first, optionally from a date on. */
export const getRevenue = cache(async (productId: string, since?: string): Promise<Revenue[]> => {
  await requireUser();
  const supabase = await createClient();
  let query = supabase.from("revenue").select("*").eq("product_id", productId);
  if (since) query = query.gte("date", since);
  const { data, error } = await query.order("date", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw dbError("load your revenue", error);
  return data;
});

export async function createRevenue(productId: string, input: RevenueInput): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("revenue").insert({ ...input, product_id: productId });
  if (error) throw dbError("save this revenue", error);
}

export async function updateRevenue(id: string, input: RevenueInput): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("revenue").update(input).eq("id", id).select("id");
  if (error) throw dbError("save this revenue", error);
  if (!data.length) throw new UserFacingError("That entry doesn't exist or isn't yours.");
}

export async function deleteRevenue(id: string): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("revenue").delete().eq("id", id).select("id");
  if (error) throw dbError("delete this revenue", error);
  if (!data.length) throw new UserFacingError("That entry doesn't exist or isn't yours.");
}
