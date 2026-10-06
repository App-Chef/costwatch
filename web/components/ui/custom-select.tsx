"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export type SelectOption = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

export function CustomSelect({
  id,
  name,
  value: controlledValue,
  defaultValue,
  options,
  onChange,
  required,
  disabled,
  className,
  placeholder = "Select...",
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(controlledValue ?? defaultValue ?? "");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const menuId = useId();

  const currentValue = controlledValue ?? selectedValue;
  const selectedOption = options.find((opt) => opt.value === currentValue);

  const selectOption = useCallback(
    (value: string) => {
      setSelectedValue(value);
      setOpen(false);
      buttonRef.current?.focus();
      
      // Trigger onChange
      if (onChange) {
        onChange(value);
      }
      
      // Trigger change event on hidden input for form handling
      if (hiddenInputRef.current) {
        const event = new Event("change", { bubbles: true });
        hiddenInputRef.current.value = value;
        hiddenInputRef.current.dispatchEvent(event);
      }
    },
    [onChange]
  );

  const close = useCallback((restore = true) => {
    setOpen(false);
    if (restore) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointer = (e: PointerEvent) => {
      if (!listRef.current?.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) {
        close(false);
      }
    };

    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open, close]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    } else if (e.key === " " && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    const buttons = [...(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])];
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = buttons[Math.min(current + 1, buttons.length - 1)];
      next?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = buttons[Math.max(current - 1, 0)];
      prev?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      buttons[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      buttons[buttons.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  useEffect(() => {
    if (open && listRef.current) {
      const selected = listRef.current.querySelector<HTMLButtonElement>('[aria-selected="true"]');
      if (selected) {
        selected.focus();
      } else {
        listRef.current.querySelector<HTMLButtonElement>('[role="option"]')?.focus();
      }
    }
  }, [open]);

  return (
    <div className={cn("relative", className)}>
      {/* Hidden input for form submission */}
      <input
        ref={hiddenInputRef}
        type="hidden"
        id={id}
        name={name}
        value={currentValue}
        required={required}
      />

      {/* Custom select button */}
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="listbox"
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        disabled={disabled}
        onKeyDown={onKeyDown}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-md border-[1.5px] border-ink/80 bg-card px-3 text-left text-[15px] font-semibold text-ink",
          "transition-[box-shadow,border-color,transform] duration-150 ease-out",
          "hover:border-ink hover:-translate-y-px hover:shadow-[2px_3px_0_0_var(--color-line)]",
          "focus:border-ink focus:-translate-y-px focus:shadow-[2px_3px_0_0_var(--color-line)] focus:outline-none focus-visible:outline-none",
          "active:translate-y-0 active:shadow-hard-sm",
          ariaInvalid && "border-loss shadow-[2px_2px_0_0_var(--color-loss)]",
          disabled && "cursor-not-allowed bg-sunken opacity-70",
          !selectedOption && "text-muted/70 font-normal"
        )}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        <ChevronDownIcon
          size={16}
          className={cn(
            "shrink-0 text-ink transition-transform duration-150 ease-out",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown list */}
      {open && (
        <div
          ref={listRef}
          id={menuId}
          role="listbox"
          onKeyDown={onListKeyDown}
          className={cn(
            "absolute z-40 mt-1.5 max-h-64 w-full overflow-auto rounded-md border-2 border-line bg-card p-1.5 shadow-hard",
            "animate-rise origin-top"
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === currentValue;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                onClick={() => selectOption(option.value)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-sm px-3 py-2.5 text-left text-sm font-semibold outline-none",
                  "transition-[background-color,transform,box-shadow] duration-150 ease-out",
                  "hover:bg-accent-soft hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-line)]",
                  "focus:bg-accent-soft focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[1px_1px_0_0_var(--color-line)]",
                  isSelected && "bg-accent-soft"
                )}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {isSelected && (
                  <svg
                    className="size-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
