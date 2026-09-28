"use client";

import { useState, useTransition } from "react";
import { deleteCostAction, setCostStatusAction } from "@/app/actions/costs";
import { CostForm } from "@/components/forms/cost-form";
import { useFormAction } from "@/components/forms/use-action-feedback";
import { MoreIcon, PlusIcon } from "@/components/icons";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Menu } from "@/components/ui/menu";
import { Spinner } from "@/components/ui/spinner";
import type { Cost } from "@/types/database";

export function AddCostButton({
  productCurrency,
  today,
  label = "Add cost",
  variant = "primary",
  size = "md",
}: {
  productCurrency: string;
  today: string;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <PlusIcon size={16} />
        {label}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Add a cost" description="A service, subscription or anything else your product pays for.">
        <CostForm productCurrency={productCurrency} today={today} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

export function CostActions({ cost, productCurrency, today }: { cost: Cost; productCurrency: string; today: string }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [, statusAction] = useFormAction(setCostStatusAction, undefined, { toastErrors: true });
  const [, deleteAction] = useFormAction(deleteCostAction, () => setConfirmDelete(false), { toastErrors: true });
  const [pending, startTransition] = useTransition();

  const run = (action: (fd: FormData) => void, fields: Record<string, string>) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    startTransition(() => action(fd));
  };

  return (
    <>
      <Menu
        label={`Actions for ${cost.name}`}
        triggerClassName="grid size-9 place-items-center rounded-md border border-transparent text-ink-2 transition-colors duration-150 hover:border-line hover:bg-card hover:text-ink aria-expanded:border-line aria-expanded:bg-card"
        trigger={pending ? <Spinner /> : <MoreIcon />}
        items={[
          { key: "edit", label: "Edit", onSelect: () => setEditing(true) },
          cost.status === "active"
            ? { key: "pause", label: "Pause", onSelect: () => run(statusAction, { id: cost.id, status: "paused" }) }
            : { key: "resume", label: "Mark active", onSelect: () => run(statusAction, { id: cost.id, status: "active" }) },
          ...(cost.status !== "inactive"
            ? [{ key: "inactive", label: "Mark inactive", onSelect: () => run(statusAction, { id: cost.id, status: "inactive" }) }]
            : []),
          { type: "separator", key: "sep" },
          { key: "delete", label: "Delete", tone: "danger", onSelect: () => setConfirmDelete(true) },
        ]}
      />

      <Dialog open={editing} onClose={() => setEditing(false)} title={`Edit ${cost.name}`}>
        <CostForm cost={cost} productCurrency={productCurrency} today={today} onDone={() => setEditing(false)} />
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title={`Delete ${cost.name}?`} size="sm">
        <p className="text-[15px] text-ink-2">
          This removes the cost and its price history. If you stopped paying for it, you can <strong className="text-ink">mark it inactive</strong>{" "}
          instead to keep its history.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" disabled={pending} onClick={() => run(deleteAction, { id: cost.id })}>
            {pending && <Spinner />}
            Delete cost
          </Button>
        </div>
      </Dialog>
    </>
  );
}
