import "server-only";

import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";
import type { ActionState } from "./action-state";
import { UserFacingError } from "./data/errors";
import { fieldErrors } from "./validation";

export function formValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) out[key] = value;
  }
  return out;
}

type Parsed<T> = { ok: true; data: T } | { ok: false; state: ActionState };

export function parseForm<S extends z.ZodType>(schema: S, formData: FormData): Parsed<z.output<S>> {
  const values = formValues(formData);
  const result = schema.safeParse(values);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    state: {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: fieldErrors(result.error),
      values,
      at: Date.now(),
    },
  };
}

/**
 * Runs a mutation and turns failures into a readable ActionState.
 * Redirects and other Next.js control flow are re-thrown untouched.
 */
export async function attempt(
  fn: () => Promise<void>,
  opts: { success?: string; values?: Record<string, string> } = {},
): Promise<ActionState> {
  try {
    await fn();
    return { status: "success", message: opts.success, at: Date.now() };
  } catch (error) {
    unstable_rethrow(error);
    const message =
      error instanceof UserFacingError ? error.message : "Something went wrong on our side. Please try again.";
    if (!(error instanceof UserFacingError)) console.error("[costwatch] unexpected action error");
    return { status: "error", message, values: opts.values, at: Date.now() };
  }
}
