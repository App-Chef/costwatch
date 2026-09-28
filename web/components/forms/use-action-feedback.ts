"use client";

import { useActionState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import { idle, type ActionState } from "@/lib/action-state";

type ServerAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * `useActionState` plus feedback: toasts the result and runs `onSuccess`.
 * Feedback fires as soon as the action resolves (not in an effect), so it
 * still shows when the form unmounts in the same render — e.g. an empty
 * state that disappears once the first item is added.
 */
export function useFormAction(action: ServerAction, onSuccess?: () => void, opts: { toastErrors?: boolean } = {}) {
  const toast = useToast();
  const callback = useRef(onSuccess);
  useEffect(() => {
    callback.current = onSuccess;
  });

  return useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.status === "success") {
      if (result.message) toast(result.message);
      callback.current?.();
    } else if (result.status === "error" && opts.toastErrors && result.message) {
      toast(result.message, "error");
    }
    return result;
  }, idle);
}
