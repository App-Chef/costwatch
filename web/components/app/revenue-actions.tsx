"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteRevenueAction } from "@/app/actions/revenue";
import { RevenueForm } from "@/components/forms/revenue-form";
import { useActionFeedback } from "@/components/forms/use-action-feedback";
import { MoreIcon, PlusIcon } from "@/components/icons";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Menu } from "@/components/ui/menu";
import { Spinner } from "@/components/ui/spinner";
import { idle } from "@/lib/action-state";
import type { Revenue } from "@/types/database";

export function AddRevenueButton({
  productCurrency,
  today,
  sources,
  label = "Add revenue",
  variant = "primary",
  size = "md",
}: {
  productCurrency: string;
  today: string;
  sources: string[];
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
      <Dialog open={open} onClose={() => setOpen(false)} title="Add revenue" description="Money your product earned. Enter it as you receive it." size="sm">
        <RevenueForm productCurrency={productCurrency} today={today} sources={sources} onDone={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

export function RevenueActions({ entry, productCurrency, today, sources }: { entry: Revenue; productCurrency: string; today: string; sources: string[] }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteState, deleteAction] = useActionState(deleteRevenueAction, idle);
  const [pending, startTransition] = useTransition();
  useActionFeedback(deleteState, () => setConfirmDelete(false), { toastErrors: true });

  const remove = () => {
    const fd = new FormData();
    fd.set("id", entry.id);
    startTransition(() => deleteAction(fd));
  };

  const label = entry.source ? `${entry.source} on ${entry.date}` : `entry on ${entry.date}`;

  return (
    <>
      <Menu
        label={`Actions for ${label}`}
        triggerClassName="grid size-9 place-items-center rounded-md border border-transparent text-ink-2 transition-colors duration-150 hover:border-line hover:bg-card hover:text-ink aria-expanded:border-line aria-expanded:bg-card"
        trigger={pending ? <Spinner /> : <MoreIcon />}
        items={[
          { key: "edit", label: "Edit", onSelect: () => setEditing(true) },
          { type: "separator", key: "sep" },
          { key: "delete", label: "Delete", tone: "danger", onSelect: () => setConfirmDelete(true) },
        ]}
      />
      <Dialog open={editing} onClose={() => setEditing(false)} title="Edit revenue" size="sm">
        <RevenueForm entry={entry} productCurrency={productCurrency} today={today} sources={sources} onDone={() => setEditing(false)} />
      </Dialog>
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this revenue entry?" size="sm">
        <p className="text-[15px] text-ink-2">It will be removed from your totals. This can&apos;t be undone.</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" disabled={pending} onClick={remove}>
            {pending && <Spinner />}
            Delete entry
          </Button>
        </div>
      </Dialog>
    </>
  );
}
