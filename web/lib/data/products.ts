import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { PRODUCT_COOKIE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { ProductInput } from "@/lib/validation";
import type { Product } from "@/types/database";
import { requireUser } from "./auth";
import { dbError, UserFacingError } from "./errors";

export const getProducts = cache(async (): Promise<Product[]> => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: true });
  if (error) throw dbError("load your products", error);
  return data;
});

/**
 * The product the dashboard is showing: the one remembered in a cookie, or
 * the oldest product. Null when the user has no products yet.
 */
export const getActiveProduct = cache(async (): Promise<Product | null> => {
  const products = await getProducts();
  const selected = (await cookies()).get(PRODUCT_COOKIE)?.value;
  return products.find((p) => p.id === selected) ?? products[0] ?? null;
});

export async function requireActiveProduct(): Promise<Product> {
  const product = await getActiveProduct();
  if (!product) throw new UserFacingError("Create a product first.");
  return product;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({ ...input, user_id: user.id })
    .select("*")
    .single();
  if (error) throw dbError("create this product", error);
  return data;
}

export async function updateProduct(id: string, input: ProductInput): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").update(input).eq("id", id).select("id");
  if (error) throw dbError("save this product", error);
  if (!data.length) throw new UserFacingError("That product doesn't exist or isn't yours.");
}

export async function deleteProduct(id: string): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").delete().eq("id", id).select("id");
  if (error) throw dbError("delete this product", error);
  if (!data.length) throw new UserFacingError("That product doesn't exist or isn't yours.");
}
