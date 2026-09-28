import { categoryName } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

export function CategoryBreakdown({
  items,
  currency,
  total,
}: {
  items: { category: string; monthly: number; count: number }[];
  currency: string;
  total: number;
}) {
  const max = Math.max(...items.map((i) => i.monthly), 0);
  return (
    <ul className="flex flex-col gap-3.5">
      {items.map((item) => {
        const share = total > 0 ? (item.monthly / total) * 100 : 0;
        return (
          <li key={item.category} className="grid grid-cols-[minmax(6.5rem,8rem)_1fr_auto] items-center gap-3 text-sm">
            <span className="truncate font-medium">{categoryName(item.category)}</span>
            <span className="h-2.5 overflow-hidden rounded-sm bg-sunken" aria-hidden="true">
              <span
                className="block h-full rounded-sm bg-cost transition-[width] duration-200 ease-out"
                style={{ width: `${max > 0 ? Math.max((item.monthly / max) * 100, 2) : 0}%` }}
              />
            </span>
            <span className="tabular min-w-24 text-right font-mono">
              {formatMoney(item.monthly, currency)}
              <span className="ml-2 inline-block w-9 text-xs text-muted">{Math.round(share)}%</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
