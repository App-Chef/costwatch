"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { attempt, formValues, parseForm } from "@/lib/actions";
import { COST_STATUS_VALUES } from "@/lib/constants";
import { createCost, deleteCost, setCostStatus, updateCost } from "@/lib/data/costs";
import { requireActiveProduct } from "@/lib/data/products";
import { costSchema, uuidSchema } from "@/lib/validation";
import { z } from "zod";

export async function saveCostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const rawId = formData.get("id");
  const id = rawId ? uuidSchema.safeParse(rawId) : null;
  if (id && !id.success) return { status: "error", message: "That cost could not be found." };

  const parsed = parseForm(costSchema, formData);
  if (!parsed.ok) return parsed.state;

  const state = await attempt(
    async () => {
      if (id?.success) {
        await updateCost(id.data, parsed.data);
      } else {
        const product = await requireActiveProduct();
        await createCost(product.id, parsed.data);
      }
    },
    { success: id ? "Cost saved." : "Cost added.", values: formValues(formData) },
  );
  revalidatePath("/app", "layout");
  return state;
}

export async function deleteCostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = uuidSchema.safeParse(formData.get("id"));
  if (!id.success) return { status: "error", message: "That cost could not be found." };
  const state = await attempt(() => deleteCost(id.data), { success: "Cost deleted." });
  revalidatePath("/app", "layout");
  return state;
}

const statusSchema = z.enum(COST_STATUS_VALUES);

export async function setCostStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = uuidSchema.safeParse(formData.get("id"));
  const status = statusSchema.safeParse(formData.get("status"));
  if (!id.success || !status.success) return { status: "error", message: "That change isn't valid." };
  const labels = { active: "Cost resumed.", paused: "Cost paused.", inactive: "Cost marked inactive." };
  const state = await attempt(() => setCostStatus(id.data, status.data), { success: labels[status.data] });
  revalidatePath("/app", "layout");
  return state;
}
