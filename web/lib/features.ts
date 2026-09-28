/** Google sign-in needs provider setup in Supabase, so it's opt-in. */
export const googleAuthEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
