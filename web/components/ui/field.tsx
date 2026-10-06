import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const control =
  "block w-full rounded-md border-[1.5px] border-ink/80 bg-card px-3 text-[15px] text-ink placeholder:text-muted/70 " +
  "transition-[box-shadow,border-color,transform] duration-150 ease-out " +
  "hover:border-ink focus:border-ink focus:shadow-hard-sm focus:outline-none focus-visible:outline-none " +
  "aria-[invalid=true]:border-loss aria-[invalid=true]:shadow-[2px_2px_0_0_var(--color-loss)] " +
  "disabled:cursor-not-allowed disabled:bg-sunken disabled:opacity-70";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between text-sm font-semibold text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="animate-fade-in text-sm font-medium text-loss" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** aria props that connect a control to its Field's error or hint. */
export function describedBy(id: string, error?: string, hint?: boolean) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-20 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          control,
          "h-11 appearance-none pr-9 cursor-pointer font-semibold",
          "transition-all duration-150 ease-out",
          "hover:-translate-y-px hover:shadow-[2px_3px_0_0_var(--color-line)]",
          "focus:-translate-y-px focus:shadow-[2px_3px_0_0_var(--color-line)]",
          "active:translate-y-0 active:shadow-hard-sm",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink transition-all duration-150 ease-out"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function FormMessage({ tone = "error", children }: { tone?: "error" | "success"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "animate-rise rounded-md border px-3.5 py-3 text-sm",
        tone === "error" ? "border-loss bg-loss-soft text-loss" : "border-gain bg-gain-soft text-gain",
      )}
    >
      {children}
    </div>
  );
}
