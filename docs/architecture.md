# Architecture

Costwatch is one Next.js application backed by Supabase. There is no custom backend server.

```text
Browser ──► Next.js (App Router)
              ├── proxy.ts           refreshes the Supabase session, guards /app
              ├── Server Components  read data through lib/data/*
              ├── Server Actions     validate (zod) → lib/data/* → revalidate
              └── Route handlers     /auth/callback, /auth/confirm, /app/export
                         │
                         ▼  (user's JWT, anon key)
                    Supabase: Auth + PostgREST + Postgres (RLS)
```

## Authorization

- The app only ever uses the **anon key plus the user's session**. Postgres Row Level Security
  decides what each request can see or change.
- `products.user_id` ties data to a user. Costs, revenue and cost history are reachable only
  through products the user owns (`public.owns_product()`), for reads **and** writes: a cost
  can't be inserted into, or moved onto, someone else's product.
- Table grants are explicit: `anon` can read only the currency and category lists, and nobody
  can write `cost_history` except the trigger.
- Server actions also check the session (`requireUser`) and validate input, but they are not the
  security boundary. RLS is.

## Layers

| Path | Responsibility |
| --- | --- |
| `web/lib/calc.ts` | Pure money math (monthly equivalents, profit, renewals, history) |
| `web/lib/validation.ts` | zod schemas shared by every server action |
| `web/lib/data/*` | Server-only data access: `getProducts`, `createCost`, `getDashboardSummary`, … |
| `web/app/actions/*` | Server Actions: parse form → call data layer → revalidate |
| `web/app/app/*` | Dashboard pages (Overview, Costs, Revenue, Renewals, Settings) |
| `web/components/*` | UI primitives, charts, forms |
| `supabase/migrations` | Schema, constraints, triggers, RLS |

## Selected product

The active product id lives in an HTTP-only cookie (`cw_product`). It's never placed in URLs,
and it is re-checked against the user's own product list on every request.

## Future integrations

Integrations (Stripe, Paddle, Vercel, AWS, and so on) would write into the same `costs` and
`revenue` tables, ideally with a `source` or `external_id` column added in a migration, so the
calculations and UI don't need to change. None are implemented in v1 on purpose.
