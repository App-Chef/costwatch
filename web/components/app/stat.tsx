import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Stat({ label, value, sub, emphasis, className }: { label: string; value: ReactNode; sub?: ReactNode; emphasis?: boolean; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2 rounded-md border border-line bg-card p-4 sm:p-5", emphasis && "shadow-[3px_3px_0_0_var(--color-accent)]", className)}>
      <p className="text-sm font-semibold text-ink-2">{label}</p>
      <div className="tabular truncate font-mono text-2xl font-semibold tracking-tight sm:text-[2rem] sm:leading-none">{value}</div>
      {sub && <div className="text-[13px] leading-snug text-muted">{sub}</div>}
    </div>
  );
}
