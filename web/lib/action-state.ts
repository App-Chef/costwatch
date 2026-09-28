import type { FieldErrors } from "./validation";

/** What every form action returns to `useActionState`. */
export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
  /** Submitted values, so a form can keep them after an error. */
  values?: Record<string, string>;
  /** Changes on every result, so clients can react to repeated successes. */
  at?: number;
};

export const idle: ActionState = { status: "idle" };
