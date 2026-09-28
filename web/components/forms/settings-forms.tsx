"use client";

import { useActionState, useState } from "react";
import { deleteAccountAction, updateProfileAction } from "@/app/actions/account";
import { deleteProductAction } from "@/app/actions/products";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { describedBy, Field, FormMessage, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { idle } from "@/lib/action-state";
import { useActionFeedback } from "./use-action-feedback";

export function ProfileForm({ name }: { name: string | null }) {
  const [state, action] = useActionState(updateProfileAction, idle);
  useActionFeedback(state);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="flex flex-col gap-4 sm:flex-row sm:items-end" noValidate>
      <Field label="Your name" htmlFor="profile-name" error={e.name} optional className="flex-1">
        <Input id="profile-name" name="name" maxLength={120} autoComplete="name" defaultValue={state.values?.name ?? name ?? ""} {...describedBy("profile-name", e.name)} />
      </Field>
      <SubmitButton variant="secondary" pendingLabel="Saving…">
        Save
      </SubmitButton>
    </form>
  );
}

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(deleteProductAction, idle);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete product
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={`Delete ${name}?`} size="sm">
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={id} />
          <p className="text-[15px] text-ink-2">
            This permanently deletes <strong className="text-ink">{name}</strong> with all of its costs, cost history and revenue. It can&apos;t be undone.
          </p>
          {state.status === "error" && state.message && <FormMessage>{state.message}</FormMessage>}
          <Field label={`Type "${name}" to confirm`} htmlFor="confirm-product">
            <Input id="confirm-product" name="confirm" autoComplete="off" required />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton variant="danger" pendingLabel="Deleting…">
              Delete forever
            </SubmitButton>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(deleteAccountAction, idle);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete account
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Delete your account?" size="sm">
        <form action={action} className="flex flex-col gap-4">
          <p className="text-[15px] text-ink-2">
            Your account and every product, cost and revenue entry in it will be permanently deleted. Consider exporting your data first.
          </p>
          {state.status === "error" && state.message && <FormMessage>{state.message}</FormMessage>}
          <Field label='Type "delete my account" to confirm' htmlFor="confirm-account">
            <Input id="confirm-account" name="confirm" autoComplete="off" required />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton variant="danger" pendingLabel="Deleting…">
              Delete everything
            </SubmitButton>
          </div>
        </form>
      </Dialog>
    </>
  );
}
