"use client";

import { useActionState } from "react";
import { createProductAction, updateProductAction } from "@/app/actions/products";
import { describedBy, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { idle } from "@/lib/action-state";
import { CURRENCIES } from "@/lib/constants";
import type { Product } from "@/types/database";
import { useActionFeedback } from "./use-action-feedback";

export function ProductForm({ product, onDone, submitLabel }: { product?: Product; onDone?: () => void; submitLabel?: string }) {
  const [state, action] = useActionState(product ? updateProductAction : createProductAction, idle);
  useActionFeedback(state, onDone);
  const v = state.values;
  const e = state.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {product && <input type="hidden" name="id" value={product.id} />}
      {state.status === "error" && !state.fieldErrors && state.message && <FormMessage>{state.message}</FormMessage>}

      <Field label="Product name" htmlFor="product-name" error={e.name}>
        <Input
          id="product-name"
          name="name"
          required
          maxLength={80}
          autoComplete="off"
          placeholder="My SaaS"
          defaultValue={v?.name ?? product?.name ?? ""}
          autoFocus={!product}
          {...describedBy("product-name", e.name)}
        />
      </Field>

      <Field
        label="Currency"
        htmlFor="product-currency"
        error={e.currency}
        hint="Totals are calculated in this currency. Costwatch never converts between currencies."
      >
        <Select
          id="product-currency"
          name="currency"
          defaultValue={v?.currency ?? product?.currency ?? "USD"}
          {...describedBy("product-currency", e.currency, true)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Description" htmlFor="product-description" error={e.description} optional>
        <Textarea
          id="product-description"
          name="description"
          maxLength={500}
          rows={2}
          defaultValue={v?.description ?? product?.description ?? ""}
          {...describedBy("product-description", e.description)}
        />
      </Field>

      <div className="flex justify-end pt-1">
        <SubmitButton pendingLabel="Saving…">{submitLabel ?? (product ? "Save product" : "Create product")}</SubmitButton>
      </div>
    </form>
  );
}
