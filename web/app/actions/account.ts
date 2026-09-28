"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { attempt, parseForm } from "@/lib/actions";
import { PRODUCT_COOKIE } from "@/lib/constants";
import { UserFacingError } from "@/lib/data/errors";
import { deleteAccount, updateProfile } from "@/lib/data/profile";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation";

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(profileSchema, formData);
  if (!parsed.ok) return parsed.state;
  const state = await attempt(() => updateProfile(parsed.data.name), { success: "Profile saved." });
  revalidatePath("/app/settings");
  return state;
}

export async function deleteAccountAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const state = await attempt(async () => {
    if (String(formData.get("confirm") ?? "").trim().toLowerCase() !== "delete my account") {
      throw new UserFacingError('Type "delete my account" to confirm.');
    }
    await deleteAccount();
    (await cookies()).delete(PRODUCT_COOKIE);
  });
  if (state.status === "success") redirect("/?deleted=1");
  return state;
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(PRODUCT_COOKIE);
  revalidatePath("/", "layout");
  redirect("/login");
}
