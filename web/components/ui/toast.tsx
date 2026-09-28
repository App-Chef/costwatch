"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertIcon, CheckIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

type Toast = { id: number; message: string; tone: "success" | "error" };

const ToastContext = createContext<(message: string, tone?: Toast["tone"]) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const push = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = ++nextId.current;
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
  }, []);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:right-6 lg:bottom-6 lg:left-auto lg:items-end"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDone }: { toast: Toast; onDone: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(toast.id), toast.tone === "error" ? 6000 : 3500);
    return () => clearTimeout(timer);
  }, [toast, onDone]);

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex max-w-sm animate-rise items-center gap-2.5 rounded-md border border-line bg-card px-4 py-3 text-sm font-medium shadow-hard",
      )}
    >
      <span className={cn("grid size-5 shrink-0 place-items-center rounded-sm", toast.tone === "error" ? "bg-loss text-white" : "bg-ink text-white")}>
        {toast.tone === "error" ? <AlertIcon size={13} /> : <CheckIcon size={13} />}
      </span>
      {toast.message}
    </div>
  );
}
