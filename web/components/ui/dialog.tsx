"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { CloseIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

/**
 * Accessible modal built on the native <dialog> element: focus is trapped and
 * restored by the browser, Escape closes it, and the page behind is inert.
 * On small screens it becomes a bottom sheet.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-auto max-h-[92dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-md border border-line bg-card p-0 text-ink shadow-hard-lg",
        "max-sm:mb-0 max-sm:w-full max-sm:max-w-full max-sm:rounded-b-none max-sm:border-b-0",
        size === "sm" ? "max-w-md" : "max-w-xl",
      )}
    >
      {open && (
        <div className="flex flex-col">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-hairline bg-card px-5 py-4">
            <div>
              <h2 id={titleId} className="text-lg font-bold tracking-tight">
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-0.5 text-sm text-muted">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-1.5 grid size-9 shrink-0 place-items-center rounded-md text-ink-2 transition-colors duration-150 hover:bg-sunken hover:text-ink"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="px-5 py-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
