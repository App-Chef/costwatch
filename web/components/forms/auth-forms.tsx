"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { googleSignInAction, magicLinkAction, requestPasswordResetAction, signInAction, signUpAction, updatePasswordAction } from "@/app/actions/auth";
import { GoogleIcon } from "@/components/icons";
import { describedBy, Field, FormMessage, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { idle } from "@/lib/action-state";

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs font-semibold tracking-wide text-muted uppercase" aria-hidden="true">
      <span className="h-px flex-1 bg-hairline" />
      or
      <span className="h-px flex-1 bg-hairline" />
    </div>
  );
}

export function GoogleButton({ next }: { next: string }) {
  return (
    <>
      <form action={googleSignInAction}>
        <input type="hidden" name="next" value={next} />
        <SubmitButton variant="secondary" size="lg" className="w-full" pendingLabel="Redirecting…">
          <GoogleIcon />
          Continue with Google
        </SubmitButton>
      </form>
      <Divider />
    </>
  );
}

export function SignInForm({ next, google }: { next: string; google: boolean }) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [pwState, pwAction] = useActionState(signInAction, idle);
  const [mlState, mlAction] = useActionState(magicLinkAction, idle);
  const state = mode === "password" ? pwState : mlState;
  const e = state.fieldErrors ?? {};
  const email = pwState.values?.email ?? mlState.values?.email ?? "";

  if (mode === "magic" && mlState.status === "success") {
    return (
      <div className="flex flex-col gap-4">
        <FormMessage tone="success">{mlState.message}</FormMessage>
        <button type="button" className="self-start text-sm font-semibold underline underline-offset-4" onClick={() => setMode("password")}>
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div>
      {google && <GoogleButton next={next} />}
      <form action={mode === "password" ? pwAction : mlAction} className="flex flex-col gap-4" noValidate>
        <input type="hidden" name="next" value={next} />
        {state.status === "error" && state.message && !state.fieldErrors && <FormMessage>{state.message}</FormMessage>}
        <Field label="Email" htmlFor="email" error={e.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={email} {...describedBy("email", e.email)} />
        </Field>
        {mode === "password" && (
          <Field label="Password" htmlFor="password" error={e.password}>
            <Input id="password" name="password" type="password" autoComplete="current-password" required {...describedBy("password", e.password)} />
          </Field>
        )}
        <SubmitButton size="lg" className="mt-1 w-full" pendingLabel={mode === "password" ? "Signing in…" : "Sending link…"}>
          {mode === "password" ? "Sign in" : "Email me a sign-in link"}
        </SubmitButton>
      </form>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm">
        <button
          type="button"
          className="font-semibold underline decoration-hairline underline-offset-4 transition-colors duration-150 hover:decoration-ink"
          onClick={() => setMode(mode === "password" ? "magic" : "password")}
        >
          {mode === "password" ? "Use a magic link instead" : "Use a password instead"}
        </button>
        {mode === "password" && (
          <Link href="/reset-password" className="text-ink-2 underline decoration-hairline underline-offset-4 hover:text-ink hover:decoration-ink">
            Forgot password?
          </Link>
        )}
      </div>
    </div>
  );
}

export function SignUpForm({ google }: { google: boolean }) {
  const [state, action] = useActionState(signUpAction, idle);
  const e = state.fieldErrors ?? {};

  if (state.status === "success") {
    return <FormMessage tone="success">{state.message}</FormMessage>;
  }

  return (
    <div>
      {google && <GoogleButton next="/app" />}
      <form action={action} className="flex flex-col gap-4" noValidate>
        {state.status === "error" && state.message && !state.fieldErrors && <FormMessage>{state.message}</FormMessage>}
        <Field label="Name" htmlFor="name" optional>
          <Input id="name" name="name" autoComplete="name" maxLength={120} defaultValue={state.values?.name ?? ""} />
        </Field>
        <Field label="Email" htmlFor="email" error={e.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email ?? ""} {...describedBy("email", e.email)} />
        </Field>
        <Field label="Password" htmlFor="password" error={e.password} hint="At least 8 characters.">
          <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} {...describedBy("password", e.password, true)} />
        </Field>
        <SubmitButton size="lg" className="mt-1 w-full" pendingLabel="Creating account…">
          Create account
        </SubmitButton>
      </form>
    </div>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(requestPasswordResetAction, idle);
  const e = state.fieldErrors ?? {};
  if (state.status === "success") return <FormMessage tone="success">{state.message}</FormMessage>;
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state.status === "error" && state.message && !state.fieldErrors && <FormMessage>{state.message}</FormMessage>}
      <Field label="Email" htmlFor="email" error={e.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email ?? ""} {...describedBy("email", e.email)} />
      </Field>
      <SubmitButton size="lg" className="w-full" pendingLabel="Sending…">
        Send reset link
      </SubmitButton>
    </form>
  );
}

export function UpdatePasswordForm() {
  const [state, action] = useActionState(updatePasswordAction, idle);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state.status === "error" && state.message && !state.fieldErrors && <FormMessage>{state.message}</FormMessage>}
      <Field label="New password" htmlFor="password" error={e.password} hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} {...describedBy("password", e.password, true)} />
      </Field>
      <SubmitButton size="lg" className="w-full" pendingLabel="Saving…">
        Save new password
      </SubmitButton>
    </form>
  );
}
