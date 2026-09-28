"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { attempt, formValues, parseForm } from "@/lib/actions";
import { requireActiveProduct } from "@/lib/data/products";
import { createRevenue, deleteRevenue, updateRevenue } from "@/lib/data/revenue";
import { revenueSchema, uuidSchema } from "@/lib/validation";

export async function saveRevenueAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const rawId = formData.get("id");
  const id = rawId ? uuidSchema.safeParse(rawId) : null;
  if (id && !id.success) return { status: "error", message: "That entry could not be found." };

  const parsed = parseForm(revenueSchema, formData);
  if (!parsed.ok) return parsed.state;

  const state = await attempt(
    async () => {
      if (id?.success) {
        await updateRevenue(id.data, parsed.data);
      } else {
        const product = await requireActiveProduct();
        await createRevenue(product.id, parsed.data);
      }
    },
    { success: id ? "Revenue saved." : "Revenue added.", values: formValues(formData) },
  );
  revalidatePath("/app", "layout");
  return state;
}

export async function deleteRevenueAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = uuidSchema.safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "That entry could not be found." };
  const state = await attempt(() => deleteRevenue(id.data), { success: "Revenue deleted." });
  revalidatePath("/app", "layout");
  return state;
}
