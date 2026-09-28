"use client";

import { useState, useTransition } from "react";
import { selectProductAction } from "@/app/actions/products";
import { ProductForm } from "@/components/forms/product-form";
import { CheckIcon, ChevronDownIcon, PlusIcon } from "@/components/icons";
import { Dialog } from "@/components/ui/dialog";
import { Menu } from "@/components/ui/menu";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/database";

export function ProductSwitcher({ products, activeId, compact }: { products: Pick<Product, "id" | "name" | "currency">[]; activeId: string | null; compact?: boolean }) {
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();
  const active = products.find((p) => p.id === activeId);

  const select = (id: string) => {
    if (id === activeId) return;
    const fd = new FormData();
    fd.set("productId", id);
    startTransition(() => selectProductAction(fd));
  };

  return (
    <>
      <Menu
        label={active ? `Product: ${active.name}. Switch product` : "Choose a product"}
        align={compact ? "end" : "start"}
        menuClassName={compact ? "w-64" : "w-full"}
        triggerClassName={cn(
          "flex items-center gap-2 rounded-md border border-line bg-card text-left font-semibold transition-[box-shadow,transform] duration-150 ease-out hover:shadow-hard-sm",
          compact ? "h-9 max-w-44 px-2.5 text-sm" : "h-11 w-full px-3 text-[15px]",
        )}
        trigger={
          <>
            <span className="grid size-5 shrink-0 place-items-center rounded-sm bg-accent text-[11px] font-extrabold text-ink" aria-hidden="true">
              {active?.name.slice(0, 1).toUpperCase() ?? "+"}
            </span>
            <span className="min-w-0 flex-1 truncate">{active?.name ?? "Add a product"}</span>
            {pending ? <Spinner /> : <ChevronDownIcon size={16} />}
          </>
        }
        items={[
          ...products.map((p) => ({
            key: p.id,
            checked: p.id === activeId,
            label: (
              <span className="flex items-center justify-between gap-3">
                <span className="truncate">{p.name}</span>
                <span className="font-mono text-xs text-muted">{p.currency}</span>
              </span>
            ),
            icon: <CheckIcon size={16} className={p.id === activeId ? "opacity-100" : "opacity-0"} />,
            onSelect: () => select(p.id),
          })),
          ...(products.length ? [{ type: "separator" as const, key: "sep" }] : []),
          { key: "new", label: "Add product", icon: <PlusIcon size={16} />, onSelect: () => setCreating(true) },
        ]}
      />
      <Dialog open={creating} onClose={() => setCreating(false)} title="Add a product" description="Track another app, site or side project separately." size="sm">
        <ProductForm onDone={() => setCreating(false)} />
      </Dialog>
    </>
  );
}
