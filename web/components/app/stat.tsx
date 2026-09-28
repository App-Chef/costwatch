import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Big numbers (e.g. "RF 1,203,450") step down in size instead of truncating. */
function valueSize(text: string | undefined) {
  const n = text?.length ?? 0;
  if (n > 13) return "text-lg sm:text-xl lg:text-lg xl:text-2xl";
  if (n > 9) return "text-xl sm:text-2xl lg:text-xl xl:text-[1.625rem]";
  return "text-2xl sm:text-[2rem] sm:leading-none";
}

export function Stat({
  label,
  value,
  valueText,
  sub,
  emphasis,
  className,
}: {
  label: string;
  value: ReactNode;
  /** Plain-text form of `value`, used to fit long numbers. */
  valueText?: string;
  sub?: ReactNode;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2 rounded-md border border-line bg-card p-4 sm:p-5", emphasis && "shadow-[3px_3px_0_0_var(--color-accent)]", className)}>
      <p className="text-sm font-semibold text-ink-2">{label}</p>
      <div className={cn("tabular font-mono leading-tight font-semibold tracking-tight break-words", valueSize(valueText ?? (typeof value === "string" ? value : undefined)))}>{value}</div>
      {sub && <div className="text-[13px] leading-snug text-muted">{sub}</div>}
    </div>
  );
}
