"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import type { ActionState } from "@/lib/action-state";

/** Toasts the result of a form action once, and runs `onSuccess`. */
export function useActionFeedback(state: ActionState, onSuccess?: () => void, opts: { toastErrors?: boolean } = {}) {
  const toast = useToast();
  const seen = useRef<number | undefined>(undefined);
  const callback = useRef(onSuccess);

  useEffect(() => {
    callback.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (!state.at || state.at === seen.current) return;
    seen.current = state.at;
    if (state.status === "success") {
      if (state.message) toast(state.message);
      callback.current?.();
    } else if (state.status === "error" && opts.toastErrors && state.message) {
      toast(state.message, "error");
    }
  }, [state, toast, opts.toastErrors]);
}
