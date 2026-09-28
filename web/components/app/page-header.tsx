import type { ReactNode } from "react";

export function PageHeader({ title, eyebrow, description, actions }: { title: string; eyebrow?: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-sm font-semibold text-muted">{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-[2.5rem] sm:leading-[1.05]">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-[15px] text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
