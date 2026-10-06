"use client";

import { createProductAction, updateProductAction } from "@/app/actions/products";
import { describedBy, Field, FormMessage, Input, Textarea } from "@/components/ui/field";
import { CustomSelect } from "@/components/ui/custom-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { CURRENCIES } from "@/lib/constants";
import type { Product } from "@/types/database";
import { useFormAction } from "./use-action-feedback";

export function ProductForm({ product, onDone, submitLabel }: { product?: Product; onDone?: () => void; submitLabel?: string }) {
  const [state, action] = useFormAction(product ? updateProductAction : createProductAction, onDone);
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
        <CustomSelect
          id="product-currency"
          name="currency"
          defaultValue={v?.currency ?? product?.currency ?? "USD"}
          options={CURRENCIES.map((c) => ({
            value: c.code,
            label: `${c.code} — ${c.name}`,
          }))}
          {...describedBy("product-currency", e.currency, true)}
        />
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
