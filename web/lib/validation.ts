import { z } from "zod";
import {
  BILLING_CYCLE_VALUES,
  CATEGORY_SLUGS,
  COST_STATUS_VALUES,
  CURRENCY_CODES,
  INTERVAL_UNIT_VALUES,
} from "./constants";
import { isISODate } from "./dates";

// Server-side validation for every write. The database enforces the same
// rules with constraints; this layer exists to give humans readable errors.

const MAX_AMOUNT = 999_999_999_999.99;

const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

const optionalText = (max: number, label: string) =>
  z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .max(max, `${label} must be ${max} characters or fewer.`)
      .nullable()
      .optional()
      .transform((v) => v ?? null),
  );

const requiredText = (max: number, label: string) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

/** Accepts "20", "20.5", "1,240.00", "1 240". Rejects negatives and >2 decimals. */
export const moneySchema = z.preprocess(
  (v) => (typeof v === "string" ? v.replace(/[\s,]/g, "") : v),
  z
    .string({ error: "Enter an amount." })
    .min(1, "Enter an amount.")
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a positive amount with up to 2 decimals, like 20 or 19.99.")
    .transform(Number)
    .refine((n) => n <= MAX_AMOUNT, "That amount is too large."),
);

const dateSchema = z.string().refine(isISODate, "Enter a valid date.");
const optionalDate = z.preprocess(emptyToNull, dateSchema.nullable().optional().transform((v) => v ?? null));

export const uuidSchema = z.uuid("Invalid id.");

export const currencySchema = z.enum(CURRENCY_CODES, { error: "Choose a supported currency." });

export const productSchema = z.object({
  name: requiredText(80, "Name"),
  description: optionalText(500, "Description"),
  currency: currencySchema,
});

export type ProductInput = z.infer<typeof productSchema>;

export const costSchema = z
  .object({
    name: requiredText(80, "Name"),
    provider: optionalText(80, "Provider"),
    amount: moneySchema,
    currency: currencySchema,
    billing_cycle: z.enum(BILLING_CYCLE_VALUES, { error: "Choose a billing cycle." }),
    custom_interval_count: z.preprocess(
      emptyToNull,
      z.coerce
        .number()
        .int("Use a whole number.")
        .min(1, "Must be at least 1.")
        .max(365, "Must be 365 or less.")
        .nullable()
        .optional(),
    ),
    custom_interval_unit: z.preprocess(emptyToNull, z.enum(INTERVAL_UNIT_VALUES).nullable().optional()),
    category: z.enum(CATEGORY_SLUGS, { error: "Choose a category." }),
    start_date: optionalDate,
    next_renewal: optionalDate,
    status: z.enum(COST_STATUS_VALUES).default("active"),
    description: optionalText(2000, "Notes"),
  })
  .superRefine((v, ctx) => {
    if (v.billing_cycle === "custom") {
      if (!v.custom_interval_count) {
        ctx.addIssue({ code: "custom", path: ["custom_interval_count"], message: "How often are you billed?" });
      }
      if (!v.custom_interval_unit) {
        ctx.addIssue({ code: "custom", path: ["custom_interval_unit"], message: "Choose days, weeks, months or years." });
      }
    }
  })
  .transform((v) => ({
    ...v,
    custom_interval_count: v.billing_cycle === "custom" ? (v.custom_interval_count ?? null) : null,
    custom_interval_unit: v.billing_cycle === "custom" ? (v.custom_interval_unit ?? null) : null,
    // One-time costs never renew.
    next_renewal: v.billing_cycle === "one_time" ? null : v.next_renewal,
  }));

export type CostInput = z.infer<typeof costSchema>;

export const revenueSchema = z.object({
  amount: moneySchema,
  currency: currencySchema,
  date: dateSchema,
  source: optionalText(80, "Source"),
  description: optionalText(2000, "Description"),
});

export type RevenueInput = z.infer<typeof revenueSchema>;

export const profileSchema = z.object({
  name: optionalText(120, "Name"),
});

export const emailSchema = z.email("Enter a valid email address.").trim().toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use 72 characters or fewer.");

export type FieldErrors = Record<string, string>;

/** Flattens zod issues to one message per field. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
