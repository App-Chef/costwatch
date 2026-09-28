"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type MenuItem =
  | { type?: "item"; label: ReactNode; onSelect: () => void; icon?: ReactNode; tone?: "danger"; checked?: boolean; key: string }
  | { type: "separator"; key: string };

/**
 * Dropdown menu following the WAI-ARIA menu button pattern:
 * Enter/Space/ArrowDown open it, arrows move, Escape closes and returns focus.
 */
export function Menu({
  label,
  trigger,
  triggerClassName,
  items,
  align = "end",
  menuClassName,
}: {
  label: string;
  trigger: ReactNode;
  triggerClassName?: string;
  items: MenuItem[];
  align?: "start" | "end";
  menuClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const focusItem = (index: number) => {
    const els = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]');
    if (!els?.length) return;
    els[(index + els.length) % els.length].focus();
  };

  const close = useCallback((restore = true) => {
    setOpen(false);
    if (restore) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    focusItem(0);
    const onPointer = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open, close]);

  const onMenuKey = (e: React.KeyboardEvent) => {
    const els = [...(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') ?? [])];
    const current = els.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(current + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem(current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusItem(els.length - 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={label}
        className={triggerClassName}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={menuRef}
          id={id}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKey}
          className={cn(
            "absolute z-40 mt-1.5 min-w-48 animate-rise rounded-md border border-line bg-card p-1 shadow-hard",
            align === "end" ? "right-0" : "left-0",
            menuClassName,
          )}
        >
          {items.map((item) =>
            item.type === "separator" ? (
              <div key={item.key} role="separator" className="my-1 h-px bg-hairline" />
            ) : (
              <button
                key={item.key}
                type="button"
                role={item.checked === undefined ? "menuitem" : "menuitemradio"}
                aria-checked={item.checked}
                tabIndex={-1}
                onClick={() => {
                  close();
                  item.onSelect();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm font-medium outline-none transition-colors duration-100",
                  "hover:bg-sunken focus:bg-sunken",
                  item.tone === "danger" ? "text-loss" : "text-ink",
                )}
              >
                {item.icon && <span className="shrink-0 text-ink-2">{item.icon}</span>}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
