"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { formValues, parseForm } from "@/lib/actions";
import { safeNextPath } from "@/lib/redirects";
import { siteOrigin } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { emailSchema, passwordSchema } from "@/lib/validation";

const credentials = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password.") });
const signUpFields = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().max(120).optional(),
});
const emailOnly = z.object({ email: emailSchema });

function authError(message: string, formData: FormData): ActionState {
  const values = formValues(formData);
  delete values.password;
  return { status: "error", message, values, at: Date.now() };
}

// Supabase error codes → human sentences. Never echo raw server errors.
function describe(code: string | undefined): string {
  switch (code) {
    case "invalid_credentials":
      return "That email and password don't match. Try again or use a magic link.";
    case "email_not_confirmed":
      return "Please confirm your email first. Check your inbox for the link.";
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Try signing in instead.";
    case "weak_password":
      return "That password is too weak. Use at least 8 characters with a mix of letters and numbers.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Please wait a minute and try again.";
    case "signup_disabled":
      return "New sign-ups are disabled on this Costwatch instance.";
    case "provider_disabled":
    case "validation_failed":
      return "This sign-in method isn't enabled on this Costwatch instance.";
    case "same_password":
      return "Your new password must be different from the old one.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(credentials, formData);
  if (!parsed.ok) return { ...parsed.state, values: { ...parsed.state.values, password: "" } };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return authError(describe(error.code), formData);
  redirect(safeNextPath(formData.get("next")));
}

export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(signUpFields, formData);
  if (!parsed.ok) return { ...parsed.state, values: { ...parsed.state.values, password: "" } };
  const supabase = await createClient();
  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/app`,
      data: parsed.data.name ? { name: parsed.data.name } : undefined,
    },
  });
  if (error) return authError(describe(error.code), formData);
  if (data.session) redirect("/app");
  return {
    status: "success",
    message: `We sent a confirmation link to ${parsed.data.email}. Open it to finish creating your account.`,
    at: Date.now(),
  };
}

export async function magicLinkAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(emailOnly, formData);
  if (!parsed.ok) return parsed.state;
  const supabase = await createClient();
  const origin = await siteOrigin();
  const next = safeNextPath(formData.get("next"));
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return authError(describe(error.code), formData);
  return {
    status: "success",
    message: `Check ${parsed.data.email} for a sign-in link. It expires in one hour.`,
    at: Date.now(),
  };
}

export async function googleSignInAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const origin = await siteOrigin();
  const next = safeNextPath(formData.get("next"));
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function requestPasswordResetAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(emailOnly, formData);
  if (!parsed.ok) return parsed.state;
  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });
  if (error && (error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit")) {
    return authError(describe(error.code), formData);
  }
  // Same answer whether or not the account exists.
  return {
    status: "success",
    message: `If an account exists for ${parsed.data.email}, a reset link is on its way.`,
    at: Date.now(),
  };
}

export async function updatePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(z.object({ password: passwordSchema }), formData);
  if (!parsed.ok) return { ...parsed.state, values: {} };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: describe(error.code), at: Date.now() };
  redirect("/app");
}
