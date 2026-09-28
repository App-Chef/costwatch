"use client";

import { useActionState, useState } from "react";
import { saveRevenueAction } from "@/app/actions/revenue";
import { describedBy, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { idle } from "@/lib/action-state";
import { CURRENCIES } from "@/lib/constants";
import type { Revenue } from "@/types/database";
import { useActionFeedback } from "./use-action-feedback";

export function RevenueForm({
  entry,
  productCurrency,
  today,
  sources,
  onDone,
}: {
  entry?: Revenue;
  productCurrency: string;
  today: string;
  sources: string[];
  onDone?: () => void;
}) {
  const [state, action] = useActionState(saveRevenueAction, idle);
  useActionFeedback(state, onDone);
  const v = state.values;
  const e = state.fieldErrors ?? {};
  const [currency, setCurrency] = useState(v?.currency ?? entry?.currency ?? productCurrency);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {entry && <input type="hidden" name="id" value={entry.id} />}
      {state.status === "error" && state.message && <FormMessage>{state.message}</FormMessage>}

      <div className="grid grid-cols-[1fr_7rem] gap-3">
        <Field label="Amount" htmlFor="rev-amount" error={e.amount}>
          <Input
            id="rev-amount"
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="1,240"
            autoFocus={!entry}
            defaultValue={v?.amount ?? (entry ? String(entry.amount) : "")}
            className="tabular font-mono text-lg"
            {...describedBy("rev-amount", e.amount)}
          />
        </Field>
        <Field label="Currency" htmlFor="rev-currency" error={e.currency}>
          <Select id="rev-currency" name="currency" value={currency} onChange={(ev) => setCurrency(ev.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {currency !== productCurrency && (
        <p className="-mt-1 rounded-md border border-warn/40 bg-warn-soft px-3 py-2 text-sm text-warn">
          Revenue in {currency} is shown separately and not added to your {productCurrency} totals.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date" htmlFor="rev-date" error={e.date}>
          <Input id="rev-date" name="date" type="date" required defaultValue={v?.date ?? entry?.date ?? today} {...describedBy("rev-date", e.date)} />
        </Field>
        <Field label="Source" htmlFor="rev-source" error={e.source} optional>
          <Input
            id="rev-source"
            name="source"
            maxLength={80}
            autoComplete="off"
            list="rev-source-list"
            placeholder="Stripe"
            defaultValue={v?.source ?? entry?.source ?? ""}
            {...describedBy("rev-source", e.source)}
          />
          <datalist id="rev-source-list">
            {sources.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
      </div>

      <Field label="Description" htmlFor="rev-description" error={e.description} optional>
        <Textarea id="rev-description" name="description" maxLength={2000} rows={2} defaultValue={v?.description ?? entry?.description ?? ""} {...describedBy("rev-description", e.description)} />
      </Field>

      <div className="flex justify-end pt-1">
        <SubmitButton pendingLabel="Saving…">{entry ? "Save revenue" : "Add revenue"}</SubmitButton>
      </div>
    </form>
  );
}
