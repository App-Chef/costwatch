import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  neutral: "border-ink/70 bg-card text-ink",
  muted: "border-hairline bg-sunken text-muted",
  accent: "border-accent-ink/40 bg-accent-soft text-accent-ink",
  gain: "border-gain/40 bg-gain-soft text-gain",
  loss: "border-loss/40 bg-loss-soft text-loss",
  warn: "border-warn/40 bg-warn-soft text-warn",
} as const;

export function Badge({ tone = "neutral", children, className }: { tone?: keyof typeof tones; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-sm border px-2 text-xs font-semibold whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
