import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/cn";

export function Money({ amount, currency, className, signed }: { amount: number; currency: string; className?: string; signed?: boolean }) {
  const text = formatMoney(amount, currency);
  return (
    <span className={cn("tabular font-mono", className)}>
      {signed && amount > 0 ? "+" : ""}
      {text}
    </span>
  );
}
