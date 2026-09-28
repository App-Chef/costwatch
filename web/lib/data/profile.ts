import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { requireUser } from "./auth";
import { dbError } from "./errors";

export async function getProfile(): Promise<Profile | null> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw dbError("load your profile", error);
  return data;
}

export async function updateProfile(name: string | null): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id);
  if (error) throw dbError("save your profile", error);
}

export async function deleteAccount(): Promise<void> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_account");
  if (error) throw dbError("delete your account", error);
  await supabase.auth.signOut();
}
