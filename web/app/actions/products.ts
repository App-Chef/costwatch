"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { attempt, formValues, parseForm } from "@/lib/actions";
import { PRODUCT_COOKIE } from "@/lib/constants";
import { createProduct, deleteProduct, getProducts, updateProduct } from "@/lib/data/products";
import { UserFacingError } from "@/lib/data/errors";
import { productSchema, uuidSchema } from "@/lib/validation";

async function rememberProduct(id: string) {
  (await cookies()).set(PRODUCT_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function createProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(productSchema, formData);
  if (!parsed.ok) return parsed.state;
  const state = await attempt(
    async () => {
      const product = await createProduct(parsed.data);
      await rememberProduct(product.id);
    },
    { success: "Product created.", values: formValues(formData) },
  );
  if (state.status === "success") {
    revalidatePath("/app", "layout");
    redirect("/app");
  }
  return state;
}

export async function updateProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = uuidSchema.safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "That product could not be found." };
  const parsed = parseForm(productSchema, formData);
  if (!parsed.ok) return parsed.state;
  const state = await attempt(() => updateProduct(id.data, parsed.data), { success: "Product saved." });
  revalidatePath("/app", "layout");
  return state;
}

export async function deleteProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = uuidSchema.safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "That product could not be found." };
  const state = await attempt(async () => {
    const product = (await getProducts()).find((p) => p.id === id.data);
    if (!product) throw new UserFacingError("That product doesn't exist or isn't yours.");
    if (String(formData.get("confirm") ?? "").trim() !== product.name) {
      throw new UserFacingError(`Type "${product.name}" to confirm.`);
    }
    await deleteProduct(id.data);
    (await cookies()).delete(PRODUCT_COOKIE);
  });
  if (state.status === "success") {
    revalidatePath("/app", "layout");
    redirect("/app");
  }
  return state;
}

export async function selectProductAction(formData: FormData): Promise<void> {
  const id = uuidSchema.safeParse(formData.get("productId"));
  if (!id.success) return;
  const products = await getProducts();
  if (!products.some((p) => p.id === id.data)) return;
  await rememberProduct(id.data);
  revalidatePath("/app", "layout");
}
