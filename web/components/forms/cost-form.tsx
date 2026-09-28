"use client";

import { useActionState, useState } from "react";
import { saveCostAction } from "@/app/actions/costs";
import { describedBy, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { idle } from "@/lib/action-state";
import { monthlyEquivalent } from "@/lib/calc";
import { BILLING_CYCLES, CATEGORIES, COST_STATUSES, CURRENCIES, INTERVAL_UNITS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import type { BillingCycle, Cost, IntervalUnit } from "@/types/database";
import { useActionFeedback } from "./use-action-feedback";

const PROVIDERS = ["Vercel", "Supabase", "Cloudflare", "GitHub", "OpenAI", "Resend", "AWS", "DigitalOcean", "Figma", "Google", "Netlify", "Stripe", "Hetzner", "Fly.io", "Railway", "Anthropic", "Postmark", "Namecheap"];

export function CostForm({
  cost,
  productCurrency,
  today,
  onDone,
}: {
  cost?: Cost;
  productCurrency: string;
  today: string;
  onDone?: () => void;
}) {
  const [state, action] = useActionState(saveCostAction, idle);
  useActionFeedback(state, onDone);
  const v = state.values;
  const e = state.fieldErrors ?? {};

  const [cycle, setCycle] = useState<BillingCycle>((v?.billing_cycle as BillingCycle) ?? cost?.billing_cycle ?? "monthly");
  const [amount, setAmount] = useState(v?.amount ?? (cost ? String(cost.amount) : ""));
  const [currency, setCurrency] = useState(v?.currency ?? cost?.currency ?? productCurrency);
  const [count, setCount] = useState(v?.custom_interval_count ?? String(cost?.custom_interval_count ?? "6"));
  const [unit, setUnit] = useState<IntervalUnit>((v?.custom_interval_unit as IntervalUnit) ?? cost?.custom_interval_unit ?? "month");

  const parsedAmount = Number(amount.replace(/[\s,]/g, ""));
  const monthly =
    Number.isFinite(parsedAmount) && parsedAmount > 0 && cycle !== "monthly"
      ? monthlyEquivalent({
          amount: parsedAmount,
          billing_cycle: cycle,
          custom_interval_count: cycle === "custom" ? Number(count) || null : null,
          custom_interval_unit: cycle === "custom" ? unit : null,
        })
      : null;

  const oneTime = cycle === "one_time";

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {cost && <input type="hidden" name="id" value={cost.id} />}
      {state.status === "error" && state.message && <FormMessage>{state.message}</FormMessage>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="cost-name" error={e.name}>
          <Input
            id="cost-name"
            name="name"
            required
            maxLength={80}
            autoComplete="off"
            placeholder="Vercel Pro"
            defaultValue={v?.name ?? cost?.name ?? ""}
            autoFocus={!cost}
            {...describedBy("cost-name", e.name)}
          />
        </Field>
        <Field label="Provider" htmlFor="cost-provider" error={e.provider} optional>
          <Input
            id="cost-provider"
            name="provider"
            maxLength={80}
            autoComplete="off"
            list="cost-provider-list"
            placeholder="Vercel"
            defaultValue={v?.provider ?? cost?.provider ?? ""}
            {...describedBy("cost-provider", e.provider)}
          />
          <datalist id="cost-provider-list">
            {PROVIDERS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </Field>
      </div>

      <div className="grid grid-cols-[1fr_7rem] gap-3 sm:grid-cols-[1fr_7rem_1fr]">
        <Field label="Amount" htmlFor="cost-amount" error={e.amount}>
          <Input
            id="cost-amount"
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="20"
            value={amount}
            onChange={(ev) => setAmount(ev.target.value)}
            className="tabular font-mono"
            {...describedBy("cost-amount", e.amount)}
          />
        </Field>
        <Field label="Currency" htmlFor="cost-currency" error={e.currency}>
          <Select id="cost-currency" name="currency" value={currency} onChange={(ev) => setCurrency(ev.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Billing" htmlFor="cost-cycle" error={e.billing_cycle} className="col-span-2 sm:col-span-1">
          <Select id="cost-cycle" name="billing_cycle" value={cycle} onChange={(ev) => setCycle(ev.target.value as BillingCycle)}>
            {BILLING_CYCLES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {currency !== productCurrency && (
        <p className="-mt-1 rounded-md border border-warn/40 bg-warn-soft px-3 py-2 text-sm text-warn">
          This cost is in {currency}, but the product uses {productCurrency}. It will be shown separately and not added to your
          {" "}{productCurrency} totals — Costwatch never converts currencies.
        </p>
      )}

      {cycle === "custom" && (
        <fieldset className="animate-rise">
          <legend className="mb-1.5 text-sm font-semibold">Billed every</legend>
          <div className="grid grid-cols-[6rem_1fr] gap-3">
            <div>
              <label htmlFor="cost-interval-count" className="sr-only">
                Interval
              </label>
              <Input
                id="cost-interval-count"
                name="custom_interval_count"
                inputMode="numeric"
                value={count}
                onChange={(ev) => setCount(ev.target.value)}
                className="tabular font-mono"
                {...describedBy("cost-interval-count", e.custom_interval_count)}
              />
            </div>
            <div>
              <label htmlFor="cost-interval-unit" className="sr-only">
                Unit
              </label>
              <Select id="cost-interval-unit" name="custom_interval_unit" value={unit} onChange={(ev) => setUnit(ev.target.value as IntervalUnit)}>
                {INTERVAL_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.plural}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          {(e.custom_interval_count || e.custom_interval_unit) && (
            <p id="cost-interval-count-error" role="alert" className="mt-1.5 text-sm font-medium text-loss">
              {e.custom_interval_count ?? e.custom_interval_unit}
            </p>
          )}
        </fieldset>
      )}

      {monthly !== null && (
        <p className="-mt-1 text-sm text-muted" aria-live="polite">
          ≈ <span className="tabular font-mono text-ink">{formatMoney(monthly, currency)}</span> per month (estimated)
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" htmlFor="cost-category" error={e.category}>
          <Select id="cost-category" name="category" defaultValue={v?.category ?? cost?.category ?? "hosting"}>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        {oneTime ? (
          <Field label="Date paid" htmlFor="cost-start" error={e.start_date}>
            <Input id="cost-start" name="start_date" type="date" defaultValue={v?.start_date ?? cost?.start_date ?? today} {...describedBy("cost-start", e.start_date)} />
          </Field>
        ) : (
          <Field label="Next renewal" htmlFor="cost-renewal" error={e.next_renewal} optional>
            <Input id="cost-renewal" name="next_renewal" type="date" defaultValue={v?.next_renewal ?? cost?.next_renewal ?? ""} {...describedBy("cost-renewal", e.next_renewal)} />
          </Field>
        )}
      </div>

      <details className="group rounded-md border border-hairline" open={Boolean(e.description || e.start_date || cost?.description)}>
        <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-2.5 text-sm font-semibold select-none [&::-webkit-details-marker]:hidden">
          More details
          <span className="text-muted transition-transform duration-150 group-open:rotate-45" aria-hidden="true">
            +
          </span>
        </summary>
        <div className="flex flex-col gap-4 border-t border-hairline px-3.5 py-4">
          {!oneTime && (
            <Field label="Started on" htmlFor="cost-start" error={e.start_date} optional hint="Used for cost history. Defaults to the day you add it.">
              <Input id="cost-start" name="start_date" type="date" defaultValue={v?.start_date ?? cost?.start_date ?? ""} {...describedBy("cost-start", e.start_date, true)} />
            </Field>
          )}
          {cost && (
            <Field label="Status" htmlFor="cost-status" hint="Paused and inactive costs are not counted in monthly totals.">
              <Select id="cost-status" name="status" defaultValue={v?.status ?? cost.status} {...describedBy("cost-status", undefined, true)}>
                {COST_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Notes" htmlFor="cost-description" error={e.description} optional>
            <Textarea id="cost-description" name="description" maxLength={2000} rows={3} defaultValue={v?.description ?? cost?.description ?? ""} {...describedBy("cost-description", e.description)} />
          </Field>
        </div>
      </details>

      <div className="flex justify-end pt-1">
        <SubmitButton pendingLabel="Saving…">{cost ? "Save cost" : "Add cost"}</SubmitButton>
      </div>
    </form>
  );
}
