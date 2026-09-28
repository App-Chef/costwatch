import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { CostInput } from "@/lib/validation";
import type { Cost, CostHistory, CostStatus } from "@/types/database";
import { requireUser } from "./auth";
import { dbError, UserFacingError } from "./errors";

export const getCosts = cache(async (productId: string): Promise<Cost[]> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("costs")
    .select("*")
    .eq("product_id", productId)
    .order("status", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw dbError("load your costs", error);
  return data;
});

export const getCostHistory = cache(async (productId: string): Promise<CostHistory[]> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cost_history")
    .select("*")
    .eq("product_id", productId)
    .order("recorded_at", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw dbError("load your cost history", error);
  return data;
});

export async function createCost(productId: string, input: CostInput): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("costs").insert({ ...input, product_id: productId });
  if (error) throw dbError("save this cost", error);
}

export async function updateCost(id: string, input: CostInput): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("costs").update(input).eq("id", id).select("id");
  if (error) throw dbError("save this cost", error);
  if (!data.length) throw new UserFacingError("That cost doesn't exist or isn't yours.");
}

export async function setCostStatus(id: string, status: CostStatus): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("costs").update({ status }).eq("id", id).select("id");
  if (error) throw dbError("update this cost", error);
  if (!data.length) throw new UserFacingError("That cost doesn't exist or isn't yours.");
}

export async function deleteCost(id: string): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("costs").delete().eq("id", id).select("id");
  if (error) throw dbError("delete this cost", error);
  if (!data.length) throw new UserFacingError("That cost doesn't exist or isn't yours.");
}
