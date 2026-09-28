import type { ReactNode } from "react";

export function EmptyState({ title, children, action, icon }: { title: string; children: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 px-5 py-10 sm:px-8">
      {icon && <div className="grid size-10 place-items-center rounded-md border border-line bg-accent-soft text-accent-ink">{icon}</div>}
      <h3 className="text-lg font-bold tracking-tight">{title}</h3>
      <div className="max-w-md text-[15px] leading-relaxed text-ink-2">{children}</div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
